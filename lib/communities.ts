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
