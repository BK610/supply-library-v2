import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

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
    const transformedItems = items.map((item: any) => ({
      ...item,
      owner_profile: item.profiles,
      profiles: undefined, // Remove the profiles property
    }));

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

    return { items: data as Item[] };
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
    return { error: "Failed to create item" };
  }
}

/**
 * Get community members
 */
export async function getCommunityMembers(
  communityId: string
): Promise<{ members?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select("member_id, role, profiles:member_id(*)")
      .eq("community_id", communityId);

    if (error) {
      console.error("Error fetching community members:", error);
      return { error: error.message };
    }

    return { members: data };
  } catch (error) {
    console.error("Unexpected error fetching community members:", error);
    return { error: "Failed to fetch community members" };
  }
}
