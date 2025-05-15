"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import { getCurrentSession } from "@/lib/auth";
import { Community } from "@/lib/communities";
import {
  Item,
  Member,
  getCommunityItems,
  getCommunityMembers,
  createItem,
} from "@/lib/items";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import Link from "next/link";

export default function CommunityPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New item form state
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemCondition, setNewItemCondition] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemConsumable, setNewItemConsumable] = useState(false);
  const [addItemError, setAddItemError] = useState("");

  // Fetch the community data, items, and members
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Check auth first
        const { user: currentUser, error: authError } =
          await getCurrentSession();
        if (authError || !currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        // Fetch community details
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .eq("id", communityId)
          .single();

        if (communityError) {
          console.error("Error fetching community:", communityError);
          setError("Failed to load community data");
          setLoading(false);
          return;
        }

        setCommunity(communityData);

        // Fetch community items
        const { items: communityItems, error: itemsError } =
          await getCommunityItems(communityId);
        if (itemsError) {
          console.error("Error fetching items:", itemsError);
          setError("Failed to load community items");
        } else if (communityItems) {
          setItems(communityItems);
        }

        // Fetch community members
        const { members: communityMembers, error: membersError } =
          await getCommunityMembers(communityId);
        if (membersError) {
          console.error("Error fetching members:", membersError);
          setError("Failed to load community members");
        } else if (communityMembers) {
          setMembers(communityMembers);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (communityId) {
      fetchData();
    }
  }, [communityId, router]);

  // Handle creating a new item
  const handleCreateItem = async () => {
    if (!user) {
      setAddItemError("You must be logged in to add an item");
      return;
    }

    if (!newItemName.trim()) {
      setAddItemError("Item name is required");
      return;
    }

    setIsCreatingItem(true);
    setAddItemError("");

    try {
      const { item, error } = await createItem(
        {
          name: newItemName,
          description: newItemDescription || undefined,
          category: newItemCategory || undefined,
          condition: newItemCondition || undefined,
          quantity: newItemQuantity,
          consumable: newItemConsumable,
        },
        communityId,
        user
      );

      if (error) {
        console.error("Error creating item:", error);
        setAddItemError(error);
        return;
      }

      if (item) {
        // Add the new item to state
        setItems((prevItems) => [...prevItems, item]);

        // Reset form
        setNewItemName("");
        setNewItemDescription("");
        setNewItemCategory("");
        setNewItemCondition("");
        setNewItemQuantity(1);
        setNewItemConsumable(false);
        setIsAddItemDialogOpen(false);
      }
    } catch (err: any) {
      console.error("Unexpected error creating item:", err);
      setAddItemError(err?.message || "Failed to create item");
    } finally {
      setIsCreatingItem(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading community data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <Link href="/app">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="mb-4">Community not found or you don't have access.</p>
        <Link href={"/app"}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href={"/app"}>
            <Button variant="outline" size="sm" className="mb-2">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{community.name}</h1>
          {community.description && (
            <p className="text-gray-600 mt-2">{community.description}</p>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Community Settings</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Community Settings</SheetTitle>
              <SheetDescription>
                Manage your community settings and members
              </SheetDescription>
            </SheetHeader>

            <div className="py-6">
              <h3 className="text-lg font-medium mb-4">Members</h3>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.profiles?.avatar_url || undefined}
                          alt={member.profiles?.username}
                        />
                        <AvatarFallback>
                          {member.profiles?.username
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profiles?.username}
                        </p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Items</h2>

          <Dialog
            open={isAddItemDialogOpen}
            onOpenChange={setIsAddItemDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new item</DialogTitle>
                <DialogDescription>
                  Add an item to share with your community
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item name*</Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewItemName(e.target.value)
                    }
                    placeholder="What is this item called?"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newItemDescription}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setNewItemDescription(e.target.value)
                    }
                    placeholder="Describe this item"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newItemCategory}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setNewItemCategory(e.target.value)
                      }
                      placeholder="Tools, Kitchen, etc."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newItemCondition}
                      onValueChange={setNewItemCondition}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItemQuantity}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setNewItemQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2 h-full pt-6">
                    <Checkbox
                      id="consumable"
                      checked={newItemConsumable}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setNewItemConsumable(checked === true)
                      }
                    />
                    <Label htmlFor="consumable">Consumable item</Label>
                  </div>
                </div>

                {addItemError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                    {addItemError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddItemDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateItem} disabled={isCreatingItem}>
                  {isCreatingItem ? "Adding..." : "Add Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              This community doesn't have any items yet.
            </p>
            <Button
              onClick={() => setIsAddItemDialogOpen(true)}
              variant="outline"
            >
              Add the first item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                      {item.category}
                    </span>
                  )}
                  {item.condition && (
                    <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                      {item.condition}
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
                      Qty: {item.quantity}
                    </span>
                  )}
                  {item.consumable && (
                    <span className="text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-1">
                      Consumable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
