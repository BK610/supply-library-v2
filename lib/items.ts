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

    // Now fetch the actual items
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .in("id", itemIds);

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return { error: itemsError.message };
    }

    return { items: items as Item[] };
  } catch (error) {
    console.error("Unexpected error fetching community items:", error);
    return { error: "Failed to fetch community items" };
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
