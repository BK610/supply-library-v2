"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import { Settings } from "lucide-react";
import {
  Community,
  inviteUserToCommunity,
  getCommunityInvitations,
  Invitation,
} from "@/lib/communities";
import {
  Item,
  getCommunityItems,
  getCommunityMembers,
  createItem,
  searchUserItems,
  addItemToCommunity,
  Member,
} from "@/lib/items";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ItemsGrid } from "@/app/components/ItemCard";
import Link from "next/link";
import { ItemCard } from "@/app/components/ItemCard";
import { Mail } from "lucide-react";
import { CreateNewItemForm } from "@/components/CreateNewItemForm";
import { useAuth } from "@/lib/auth-context";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExistingItem: (item: Item) => Promise<void>;
  onAddNewItem: (item: {
    name: string;
    description?: string;
    category?: string;
    condition?: string;
    quantity: number;
    consumable: boolean;
  }) => Promise<void>;
  isAddingExistingItem: boolean;
  isCreatingItem: boolean;
  addExistingItemError?: string;
  addItemError?: string;
  user: User;
  communityId: string;
}

function AddItemDialog({
  open,
  onOpenChange,
  onAddExistingItem,
  onAddNewItem,
  isAddingExistingItem,
  isCreatingItem,
  addExistingItemError,
  addItemError,
  user,
  communityId,
}: AddItemDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedItem(null);
      setActiveTab("search");
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { items: foundItems, error } = await searchUserItems(
        user?.id || "",
        searchQuery,
        communityId
      );

      if (error) {
        console.error("Error searching items:", error);
        return;
      }

      setSearchResults(foundItems || []);
    } catch (err) {
      console.error("Unexpected error searching items:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add an item to this community</DialogTitle>
          <DialogDescription>
            Search for existing items or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search My Items</TabsTrigger>
            <TabsTrigger value="create">Create New Item</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="pt-4">
            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pb-4">
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
                <div className="border rounded-md divide-y max-h-[40vh] overflow-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className={`${
                        selectedItem?.id === item.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <ItemCard
                        item={item}
                        onClick={() => setSelectedItem(item)}
                        className={`rounded-none border-0 ${
                          selectedItem?.id === item.id ? "bg-blue-50" : ""
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-4 border rounded-md bg-gray-50">
                  <p className="text-gray-600 mb-2">No matching items found</p>
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
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={() => onAddExistingItem(selectedItem)}
                    disabled={isAddingExistingItem}
                  >
                    {isAddingExistingItem ? "Adding..." : "Add to Community"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <CreateNewItemForm
              onSubmit={onAddNewItem}
              isSubmitting={isCreatingItem}
              error={addItemError}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const communityId = params.id;
  const { user, isLoading: isAuthLoading, error: authError } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);

  // Add item dialog state
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  // Search functionality
  const [addExistingItemError, setAddExistingItemError] = useState("");
  const [isAddingExistingItem, setIsAddingExistingItem] = useState(false);

  // New item form state
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [addItemError, setAddItemError] = useState("");

  // Invitation states
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    []
  );
  const [showInvitations, setShowInvitations] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [isAuthLoading, user, router]);

  // Fetch the community data, items, members, and invitations
  useEffect(() => {
    async function fetchData() {
      if (!user || !communityId) return;

      setLoading(true);
      setError(null);

      try {
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

        // Check if user is admin
        const { data: memberRole, error: memberRoleError } = await supabase
          .from("community_members")
          .select("role")
          .eq("community_id", communityId)
          .eq("member_id", user.id)
          .single();

        if (!memberRoleError && memberRole && memberRole.role === "admin") {
          setIsUserAdmin(true);

          // If admin, fetch pending invitations
          const { invitations, error: invitationsError } =
            await getCommunityInvitations(communityId, user.id);

          if (invitationsError) {
            console.error("Error fetching invitations:", invitationsError);
          } else if (invitations) {
            setPendingInvitations(
              invitations.filter((inv) => inv.status === "pending")
            );
          }
        }

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

    if (!isAuthLoading) {
      fetchData();
    }
  }, [communityId, user, isAuthLoading]);

  // Handle inviting a user
  const handleInviteUser = async () => {
    if (!user || !community) return;

    setIsInviting(true);
    setInviteError("");
    setInviteSuccess(false);

    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email address");
      setIsInviting(false);
      return;
    }

    try {
      const { success, error, invitation } = await inviteUserToCommunity(
        communityId,
        user.id,
        inviteEmail.trim()
      );

      if (error) {
        setInviteError(error);
        return;
      }

      if (success && invitation) {
        setInviteSuccess(true);
        setInviteEmail("");
        setPendingInvitations([...pendingInvitations, invitation]);
      }
    } catch (err: unknown) {
      console.error("Error inviting user:", err);
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setIsInviting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {authError}
        </div>
        <Link href="/app">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading community data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="mb-4">
          Community not found or you don&apos;t have access.
        </p>
        <Link href={"/app"}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="@container max-w-7xl w-full mx-auto px-4 py-4 sm:py-8">
      <Link href={"/app"}>
        <Button variant="outline" size="sm" className="mb-4 sm:mb-10">
          ← Back to Dashboard
        </Button>
      </Link>
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{community.name}</h1>
          {community.description && (
            <p className="text-gray-600 mt-2">{community.description}</p>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Settings />
              <span className="hidden sm:block">Community Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Community Settings</SheetTitle>
              <SheetDescription>
                Manage your community settings and members
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 px-4 space-y-8">
              {isUserAdmin && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Invite Members</h3>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="invite-email">Email address</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="user@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleInviteUser()
                          }
                        />
                        <Button
                          onClick={handleInviteUser}
                          disabled={isInviting || !inviteEmail.trim()}
                          size="sm"
                        >
                          {isInviting ? "Sending..." : "Invite"}
                        </Button>
                      </div>
                    </div>

                    {inviteError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        {inviteError}
                      </div>
                    )}

                    {inviteSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
                        Invitation sent successfully!
                      </div>
                    )}

                    {pendingInvitations.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowInvitations(!showInvitations)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          {showInvitations ? "Hide" : "Show"} pending
                          invitations ({pendingInvitations.length})
                        </button>

                        {showInvitations && (
                          <div className="mt-2 space-y-2">
                            {pendingInvitations.map((invitation) => (
                              <div
                                key={invitation.id}
                                className="flex items-center gap-2 text-sm border-b pb-2"
                              >
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{invitation.email}</span>
                                <span className="text-xs text-gray-400 ml-auto">
                                  {new Date(
                                    invitation.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
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
            <AddItemDialog
              open={isAddItemDialogOpen}
              onOpenChange={setIsAddItemDialogOpen}
              onAddExistingItem={async (item) => {
                setIsAddingExistingItem(true);
                setAddExistingItemError("");

                try {
                  const { success, error } = await addItemToCommunity(
                    item.id,
                    communityId
                  );

                  if (error) {
                    setAddExistingItemError(error);
                    return;
                  }

                  if (success) {
                    setItems((prevItems) => [...prevItems, item]);
                    setIsAddItemDialogOpen(false);
                  }
                } catch (err) {
                  setAddExistingItemError(
                    err instanceof Error ? err.message : "Failed to add item"
                  );
                } finally {
                  setIsAddingExistingItem(false);
                }
              }}
              onAddNewItem={async (itemData) => {
                if (!user) {
                  setAddItemError("You must be logged in to add an item");
                  return;
                }

                setIsCreatingItem(true);
                setAddItemError("");

                try {
                  const { item, error } = await createItem(
                    itemData,
                    communityId,
                    user
                  );

                  if (error) {
                    setAddItemError(error);
                    return;
                  }

                  if (item) {
                    setItems((prevItems) => [...prevItems, item]);
                    setIsAddItemDialogOpen(false);
                  }
                } catch (err) {
                  setAddItemError(
                    err instanceof Error ? err.message : "Failed to create item"
                  );
                } finally {
                  setIsCreatingItem(false);
                }
              }}
              isAddingExistingItem={isAddingExistingItem}
              isCreatingItem={isCreatingItem}
              addExistingItemError={addExistingItemError}
              addItemError={addItemError}
              user={user!}
              communityId={communityId}
            />
          </Dialog>
        </div>

        <ItemsGrid
          items={items}
          emptyMessage="This community doesn't have any items yet."
          actionButton={
            <Button
              onClick={() => setIsAddItemDialogOpen(true)}
              variant="outline"
            >
              Add the first item
            </Button>
          }
        />
      </div>
    </div>
  );
}
