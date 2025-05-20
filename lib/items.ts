import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";
import { getUserCommunities, Community } from "./communities";

export interface Item {
  id: string;
  name: string;
  description: string | null;
  condition: string | null;
  category: string | null;
  image_url: string | null;
  consumable: boolean;
  quantity: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner_profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Member {
  member_id: string;
  role: string;
  profiles: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Get all items in a community
 */
export async function getCommunityItems(
  communityId: string
): Promise<{ items?: Item[]; error?: string }> {
  try {
    // First get all item IDs in the community
    const { data: communityItemsData, error: communityItemsError } =
      await supabase
        .from("community_items")
        .select("item_id")
        .eq("community_id", communityId);

    if (communityItemsError) {
      console.error("Error fetching community item IDs:", communityItemsError);
      return { error: communityItemsError.message };
    }

    if (!communityItemsData || communityItemsData.length === 0) {
      return { items: [] };
    }

    // Extract the item IDs
    const itemIds = communityItemsData.map((item) => item.item_id);

    // Now fetch the actual items with owner profiles
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*, profiles:owner_id(username, avatar_url)")
      .in("id", itemIds);

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return { error: itemsError.message };
    }

    // Transform the result to match our Item interface
    const transformedItems = items.map(
      (
        item: Item & {
          profiles?: { username: string; avatar_url: string | null };
        }
      ) => ({
        ...item,
        owner_profile: item.profiles,
        profiles: undefined, // Remove the profiles property
      })
    );

    return { items: transformedItems as Item[] };
  } catch (error) {
    console.error("Unexpected error fetching community items:", error);
    return { error: "Failed to fetch community items" };
  }
}

/**
 * Search for items owned by a user
 */
export async function searchUserItems(
  userId: string,
  searchQuery: string,
  communityId?: string
): Promise<{ items?: Item[]; error?: string }> {
  try {
    let query = supabase
      .from("items")
      .select("*, profiles:owner_id(username, avatar_url)")
      .eq("owner_id", userId)
      .ilike("name", `%${searchQuery}%`);

    // If communityId is provided, exclude items already in the community
    if (communityId) {
      // Get items that are already in the community
      const { data: communityItemsData, error: communityItemsError } =
        await supabase
          .from("community_items")
          .select("item_id")
          .eq("community_id", communityId);

      if (communityItemsError) {
        console.error(
          "Error fetching community item IDs:",
          communityItemsError
        );
        return { error: communityItemsError.message };
      }

      if (communityItemsData && communityItemsData.length > 0) {
        // Extract the item IDs
        const communityItemIds = communityItemsData.map((item) => item.item_id);
        // Exclude these items from the search results
        query = query.not("id", "in", `(${communityItemIds.join(",")})`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error searching user items:", error);
      return { error: error.message };
    }

    // Transform the result to match our Item interface
    const transformedItems = data.map(
      (
        item: Item & {
          profiles?: { username: string; avatar_url: string | null };
        }
      ) => ({
        ...item,
        owner_profile: item.profiles,
        profiles: undefined, // Remove the profiles property
      })
    );

    return { items: transformedItems as Item[] };
  } catch (error) {
    console.error("Unexpected error searching user items:", error);
    return { error: "Failed to search user items" };
  }
}

/**
 * Add an existing item to a community
 */
export async function addItemToCommunity(
  itemId: string,
  communityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if item is already in community
    const { data: existingItem, error: checkError } = await supabase
      .from("community_items")
      .select()
      .eq("community_id", communityId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking if item exists in community:", checkError);
      return { success: false, error: checkError.message };
    }

    if (existingItem) {
      return { success: false, error: "Item is already in this community" };
    }

    // Add the item to the community
    const { error } = await supabase.from("community_items").insert({
      community_id: communityId,
      item_id: itemId,
      available: true,
    });

    if (error) {
      console.error("Error adding item to community:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error adding item to community:", error);
    return { success: false, error: "Failed to add item to community" };
  }
}

/**
 * Create a new item and add it to a community
 */
export async function createItem(
  itemData: {
    name: string;
    description?: string;
    condition?: string;
    category?: string;
    image_url?: string;
    consumable?: boolean;
    quantity?: number;
  },
  communityId: string,
  user: User
): Promise<{ item?: Item; error?: string }> {
  try {
    // Begin a transaction
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        name: itemData.name,
        description: itemData.description,
        condition: itemData.condition,
        category: itemData.category,
        image_url: itemData.image_url,
        consumable: itemData.consumable ?? false,
        quantity: itemData.quantity ?? 1,
        owner_id: user.id,
      })
      .select()
      .single();

    if (itemError) {
      console.error("Error creating item:", itemError);
      return { error: itemError.message };
    }

    // Add the item to the community
    const { error: communityItemError } = await supabase
      .from("community_items")
      .insert({
        community_id: communityId,
        item_id: item.id,
        available: true,
      });

    if (communityItemError) {
      console.error("Error adding item to community:", communityItemError);
      // Try to clean up by deleting the item we just created
      await supabase.from("items").delete().eq("id", item.id);
      return { error: communityItemError.message };
    }

    // Get the owner profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching owner profile:", profileError);
      // We'll return the item even without profile info
    } else if (profileData) {
      // Add owner profile to the item
      item.owner_profile = profileData;
    }

    return { item };
  } catch (error) {
    console.error("Unexpected error creating item:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create item",
    };
  }
}

/**
 * Get community members
 */
export async function getCommunityMembers(
  communityId: string
): Promise<{ members?: Member[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select("member_id, role, profiles:member_id(*)")
      .eq("community_id", communityId);

    if (error) {
      console.error("Error fetching community members:", error);
      return { error: error.message };
    }

    // We need to transform the data to match our Member interface
    type RawMember = {
      member_id: string;
      role: string;
      profiles: Record<string, unknown>;
    };
    const rawData = data as unknown as RawMember[];
    const transformedMembers = rawData.map((member) => ({
      member_id: member.member_id,
      role: member.role,
      profiles: member.profiles,
    })) as Member[];

    return { members: transformedMembers };
  } catch (error) {
    console.error("Unexpected error fetching community members:", error);
    return { error: "Failed to fetch community members" };
  }
}

/**
 * Get all items a user has access to in their communities
 */
export async function getUserAccessibleItems(
  userId: string,
  limit: number = 10
): Promise<{ items?: Item[]; error?: string }> {
  return searchCommunityItems(userId, "", limit);
}

/**
 * Search for items across all communities a user is in and personal items
 */
export async function searchCommunityItems(
  userId: string,
  searchQuery: string,
  limit: number = 10
): Promise<{ items?: Item[]; error?: string }> {
  try {
    // Get user's communities using existing function
    const { communities, error: communitiesError } = await getUserCommunities(
      userId
    );

    if (communitiesError) {
      console.error("Error fetching user communities:", communitiesError);
      return { error: communitiesError };
    }

    // Get items from communities
    let communityItems: Item[] = [];
    if (communities && communities.length > 0) {
      // Extract community IDs
      const communityIds = communities.map((c: Community) => c.id);

      // Get all items in these communities
      const { data: communityItemsData, error: communityItemsError } =
        await supabase
          .from("community_items")
          .select("item_id")
          .in("community_id", communityIds);

      if (communityItemsError) {
        console.error("Error fetching community items:", communityItemsError);
        return { error: communityItemsError.message };
      }

      if (communityItemsData && communityItemsData.length > 0) {
        // Extract item IDs
        const itemIds = communityItemsData.map((item) => item.item_id);

        // Build the query for community items
        let query = supabase
          .from("items")
          .select("*, profiles:owner_id(username, avatar_url)")
          .in("id", itemIds);

        // Add search condition only if searchQuery is provided
        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }

        const { data: items, error: itemsError } = await query;

        if (itemsError) {
          console.error("Error searching items:", itemsError);
          return { error: itemsError.message };
        }

        // Transform the result to match our Item interface
        communityItems = items.map(
          (
            item: Item & {
              profiles?: { username: string; avatar_url: string | null };
            }
          ) => ({
            ...item,
            owner_profile: item.profiles,
            profiles: undefined, // Remove the profiles property
          })
        ) as Item[];
      }
    }

    // Get personal items (items owned by the user but not in any community)
    let query = supabase
      .from("items")
      .select("*, profiles:owner_id(username, avatar_url)")
      .eq("owner_id", userId);

    // Add search condition only if searchQuery is provided
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    const { data: personalItems, error: personalItemsError } = await query;

    if (personalItemsError) {
      console.error("Error fetching personal items:", personalItemsError);
      return { error: personalItemsError.message };
    }

    // Transform personal items to match our Item interface
    const transformedPersonalItems = personalItems.map(
      (
        item: Item & {
          profiles?: { username: string; avatar_url: string | null };
        }
      ) => ({
        ...item,
        owner_profile: item.profiles,
        profiles: undefined, // Remove the profiles property
      })
    ) as Item[];

    // Combine community items and personal items, removing duplicates
    const allItems = [...communityItems, ...transformedPersonalItems];
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.id, item])).values()
    );

    // Apply limit
    return { items: uniqueItems.slice(0, limit) };
  } catch (error) {
    console.error("Unexpected error searching items:", error);
    return { error: "Failed to search items" };
  }
}

/**
 * Create a new item without associating it with a community
 */
export async function createPersonalItem(
  itemData: {
    name: string;
    description?: string;
    condition?: string;
    category?: string;
    image_url?: string;
    consumable?: boolean;
    quantity?: number;
  },
  user: User
): Promise<{ item?: Item; error?: string }> {
  try {
    // Create the item
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        name: itemData.name,
        description: itemData.description,
        condition: itemData.condition,
        category: itemData.category,
        image_url: itemData.image_url,
        consumable: itemData.consumable ?? false,
        quantity: itemData.quantity ?? 1,
        owner_id: user.id,
      })
      .select()
      .single();

    if (itemError) {
      console.error("Error creating item:", itemError);
      return { error: itemError.message };
    }

    // Get the owner profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching owner profile:", profileError);
      // We'll return the item even without profile info
    } else if (profileData) {
      // Add owner profile to the item
      item.owner_profile = profileData;
    }

    return { item };
  } catch (error) {
    console.error("Unexpected error creating item:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create item",
    };
  }
}
