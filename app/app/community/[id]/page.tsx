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
  searchUserItems,
  addItemToCommunity,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
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

  // Add item dialog state
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("search");

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [addExistingItemError, setAddExistingItemError] = useState("");
  const [isAddingExistingItem, setIsAddingExistingItem] = useState(false);

  // New item form state
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

  // Handle item search
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    setIsSearching(true);
    setAddExistingItemError("");

    try {
      const { items: foundItems, error } = await searchUserItems(
        user.id,
        searchQuery,
        communityId
      );

      if (error) {
        console.error("Error searching items:", error);
        setAddExistingItemError(error);
        return;
      }

      setSearchResults(foundItems || []);
    } catch (err: any) {
      console.error("Unexpected error searching items:", err);
      setAddExistingItemError(err?.message || "Failed to search items");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle adding an existing item to the community
  const handleAddExistingItem = async () => {
    if (!selectedItem) {
      setAddExistingItemError("Please select an item first");
      return;
    }

    setIsAddingExistingItem(true);
    setAddExistingItemError("");

    try {
      const { success, error } = await addItemToCommunity(
        selectedItem.id,
        communityId
      );

      if (error) {
        console.error("Error adding item:", error);
        setAddExistingItemError(error);
        return;
      }

      if (success) {
        // Add the selected item to the items list
        setItems((prevItems) => [...prevItems, selectedItem]);

        // Reset state
        setSearchQuery("");
        setSearchResults([]);
        setSelectedItem(null);
        setIsAddItemDialogOpen(false);
      }
    } catch (err: any) {
      console.error("Unexpected error adding item:", err);
      setAddExistingItemError(err?.message || "Failed to add item");
    } finally {
      setIsAddingExistingItem(false);
    }
  };

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

  // Reset the dialog state when it's closed
  const handleDialogOpenChange = (open: boolean) => {
    setIsAddItemDialogOpen(open);
    if (!open) {
      // Reset all the state when dialog closes
      setSearchQuery("");
      setSearchResults([]);
      setSelectedItem(null);
      setNewItemName("");
      setNewItemDescription("");
      setNewItemCategory("");
      setNewItemCondition("");
      setNewItemQuantity(1);
      setNewItemConsumable(false);
      setAddItemError("");
      setAddExistingItemError("");
      setActiveTab("search");
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
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add an item to this community</DialogTitle>
                <DialogDescription>
                  Search for existing items or create a new one
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search">Search My Items</TabsTrigger>
                  <TabsTrigger value="create">Create New Item</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="pt-4">
                  <div className="grid gap-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="search" className="mb-2 block">
                          Search for your existing items
                        </Label>
                        <Input
                          id="search"
                          placeholder="Search by item name"
                          value={searchQuery}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSearchQuery(e.target.value)
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                      >
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="border rounded-md divide-y max-h-[200px] overflow-auto">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 ${
                              selectedItem?.id === item.id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => setSelectedItem(item)}
                          >
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-1 flex gap-2 flex-wrap">
                              {item.category && (
                                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                  {item.category}
                                </span>
                              )}
                              {item.condition && (
                                <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                                  {item.condition}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery && !isSearching ? (
                      <div className="text-center py-4 border rounded-md bg-gray-50">
                        <p className="text-gray-600 mb-2">
                          No matching items found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("create")}
                        >
                          Create a new item
                        </Button>
                      </div>
                    ) : null}

                    {addExistingItemError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        {addExistingItemError}
                      </div>
                    )}

                    {selectedItem && (
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={handleAddExistingItem}
                          disabled={isAddingExistingItem}
                        >
                          {isAddingExistingItem
                            ? "Adding..."
                            : "Add to Community"}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="create" className="pt-4">
                  <div className="grid gap-4">
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
                          onCheckedChange={(
                            checked: boolean | "indeterminate"
                          ) => setNewItemConsumable(checked === true)}
                        />
                        <Label htmlFor="consumable">Consumable item</Label>
                      </div>
                    </div>

                    {addItemError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        {addItemError}
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleCreateItem}
                        disabled={isCreatingItem}
                      >
                        {isCreatingItem ? "Creating..." : "Create Item"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsAddItemDialogOpen(false)}
                >
                  Cancel
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
