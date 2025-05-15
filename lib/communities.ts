import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Invitation {
  id: string;
  community_id: string;
  inviter_id: string;
  email: string;
  created_at: string;
  status: "pending" | "accepted" | "declined";
  community?: Community;
  inviter?: Profile;
}

// Ensure the user profile exists before proceeding
async function ensureUserProfile(user: User): Promise<{ error?: string }> {
  try {
    // Check if the profile exists
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // If profile exists, we're good
    if (profile) return {};

    // If there was an error other than "not found", return it
    if (fetchError && !fetchError.message.includes("not found")) {
      console.error("Error checking profile:", fetchError);
      return { error: fetchError.message };
    }

    // Profile doesn't exist, create it
    const username =
      user.user_metadata?.username || `user_${user.id.substring(0, 8)}`;

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      email: user.email || "",
      avatar_url: user.user_metadata?.avatar_url || null,
    });

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return { error: insertError.message };
    }

    return {};
  } catch (error) {
    console.error("Unexpected error in ensureUserProfile:", error);
    return { error: "Failed to ensure user profile exists" };
  }
}

export async function createCommunity(
  name: string,
  user: User,
  description?: string
): Promise<{ community?: Community; error?: string }> {
  try {
    // First ensure the user profile exists
    const { error: profileError } = await ensureUserProfile(user);

    if (profileError) {
      return { error: `Profile error: ${profileError}` };
    }

    const { data, error } = await supabase
      .from("communities")
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating community:", error);
      return { error: error.message };
    }

    // Also add the creator as a member with admin role
    const { error: memberError } = await supabase
      .from("community_members")
      .insert({
        community_id: data.id,
        member_id: user.id,
        role: "admin",
      });

    if (memberError) {
      console.error("Error adding creator as member:", memberError);
      return { error: memberError.message };
    }

    return { community: data };
  } catch (error) {
    console.error("Unexpected error creating community:", error);
    return { error: "Failed to create community" };
  }
}

export async function getUserCommunities(
  userId: string
): Promise<{ communities?: Community[]; error?: string }> {
  try {
    // First get the community IDs that the user is a member of
    const { data: memberData, error: memberError } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("member_id", userId);

    if (memberError) {
      console.error("Error fetching user community memberships:", memberError);
      return { error: memberError.message };
    }

    if (!memberData || memberData.length === 0) {
      // User is not a member of any communities
      return { communities: [] };
    }

    // Extract the community IDs
    const communityIds = memberData.map((item) => item.community_id);

    // Then fetch the community details
    const { data: communities, error: communitiesError } = await supabase
      .from("communities")
      .select("*")
      .in("id", communityIds);

    if (communitiesError) {
      console.error("Error fetching communities:", communitiesError);
      return { error: communitiesError.message };
    }

    return { communities: communities as Community[] };
  } catch (error) {
    console.error("Unexpected error fetching communities:", error);
    return { error: "Failed to fetch communities" };
  }
}

export async function joinCommunity(
  communityId: string,
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    // First check if the user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("community_members")
      .select()
      .eq("community_id", communityId)
      .eq("member_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking membership:", checkError);
      return { error: checkError.message };
    }

    if (existingMember) {
      return { error: "User is already a member of this community" };
    }

    // Add user as a member
    const { error } = await supabase.from("community_members").insert({
      community_id: communityId,
      member_id: userId,
      role: "member",
    });

    if (error) {
      console.error("Error joining community:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error joining community:", error);
    return { error: "Failed to join community" };
  }
}

/**
 * Check if a user is an admin of a community
 */
export async function isUserCommunityAdmin(
  userId: string,
  communityId: string
): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", communityId)
      .eq("member_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false, error: error.message };
    }

    return { isAdmin: !!data };
  } catch (error) {
    console.error("Unexpected error checking admin status:", error);
    return { isAdmin: false, error: "Failed to check admin status" };
  }
}

/**
 * Invite a user to join a community by email
 */
export async function inviteUserToCommunity(
  communityId: string,
  inviterUserId: string,
  email: string
): Promise<{ success: boolean; error?: string; invitation?: Invitation }> {
  try {
    // First, check if the inviter is an admin
    const { isAdmin, error: adminCheckError } = await isUserCommunityAdmin(
      inviterUserId,
      communityId
    );

    if (adminCheckError) {
      return { success: false, error: adminCheckError };
    }

    if (!isAdmin) {
      return {
        success: false,
        error: "Only community admins can send invitations",
      };
    }

    // Check if the user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("community_members")
      .select("member_id, profiles:profiles!inner(email)")
      .eq("community_id", communityId)
      .eq("profiles.email", email)
      .maybeSingle();

    if (
      memberCheckError &&
      !memberCheckError.message.includes("No rows found")
    ) {
      console.error("Error checking membership:", memberCheckError);
      return { success: false, error: memberCheckError.message };
    }

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this community",
      };
    }

    // Check for existing invitations
    const { data: existingInvitation, error: inviteCheckError } = await supabase
      .from("community_invitations")
      .select("*")
      .eq("community_id", communityId)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (
      inviteCheckError &&
      !inviteCheckError.message.includes("No rows found")
    ) {
      console.error("Error checking existing invitations:", inviteCheckError);
      return { success: false, error: inviteCheckError.message };
    }

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    // Create the invitation
    const { data: invitation, error: createError } = await supabase
      .from("community_invitations")
      .insert({
        community_id: communityId,
        inviter_id: inviterUserId,
        email,
        status: "pending",
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating invitation:", createError);
      return { success: false, error: createError.message };
    }

    return {
      success: true,
      invitation: invitation as Invitation,
    };
  } catch (error) {
    console.error("Unexpected error inviting user:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

/**
 * Get all invitations for a community
 */
export async function getCommunityInvitations(
  communityId: string,
  userId: string
): Promise<{ invitations?: Invitation[]; error?: string }> {
  try {
    // Check if the user is an admin
    const { isAdmin, error: adminCheckError } = await isUserCommunityAdmin(
      userId,
      communityId
    );

    if (adminCheckError) {
      return { error: adminCheckError };
    }

    if (!isAdmin) {
      return {
        error: "Only community admins can view invitations",
      };
    }

    // Get all invitations for the community
    const { data, error } = await supabase
      .from("community_invitations")
      .select("*, profiles:inviter_id(username, email, avatar_url)")
      .eq("community_id", communityId);

    if (error) {
      console.error("Error fetching invitations:", error);
      return { error: error.message };
    }

    // Transform the data to match our interface
    const invitations = data.map((invitation: any) => ({
      ...invitation,
      inviter: invitation.profiles,
      profiles: undefined, // Remove the profiles property
    }));

    return { invitations: invitations as Invitation[] };
  } catch (error) {
    console.error("Unexpected error fetching invitations:", error);
    return { error: "Failed to fetch invitations" };
  }
}

/**
 * Get all invitations for a user by email
 */
export async function getUserInvitations(
  email: string
): Promise<{ invitations?: Invitation[]; error?: string }> {
  try {
    // Get all pending invitations for the user
    const { data, error } = await supabase
      .from("community_invitations")
      .select(
        "*, communities:community_id(*), profiles:inviter_id(username, email, avatar_url)"
      )
      .eq("email", email)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching user invitations:", error);
      return { error: error.message };
    }

    // Transform the data to match our interface
    const invitations = data.map((invitation: any) => ({
      ...invitation,
      community: invitation.communities,
      inviter: invitation.profiles,
      communities: undefined, // Remove the communities property
      profiles: undefined, // Remove the profiles property
    }));

    return { invitations: invitations as Invitation[] };
  } catch (error) {
    console.error("Unexpected error fetching user invitations:", error);
    return { error: "Failed to fetch user invitations" };
  }
}

/**
 * Accept or decline an invitation
 */
export async function respondToInvitation(
  invitationId: string,
  userId: string,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("community_invitations")
      .select("community_id, email")
      .eq("id", invitationId)
      .eq("status", "pending")
      .single();

    if (inviteError) {
      console.error("Error fetching invitation:", inviteError);
      return { success: false, error: inviteError.message };
    }

    // Get the user's email
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return { success: false, error: profileError.message };
    }

    // Verify that the invitation was sent to this user's email
    if (userProfile.email !== invitation.email) {
      return {
        success: false,
        error: "This invitation was not sent to your email address",
      };
    }

    // Update the invitation status
    const { error: updateError } = await supabase
      .from("community_invitations")
      .update({
        status: accept ? "accepted" : "declined",
      })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return { success: false, error: updateError.message };
    }

    // If accepting, add the user to the community
    if (accept) {
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: invitation.community_id,
          member_id: userId,
          role: "member",
        });

      if (memberError) {
        console.error("Error adding user to community:", memberError);
        return { success: false, error: memberError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error responding to invitation:", error);
    return { success: false, error: "Failed to respond to invitation" };
  }
}
