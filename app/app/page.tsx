"use client";
import { getCurrentSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  getUserCommunities,
  Community,
  getUserInvitations,
  Invitation,
} from "@/lib/communities";
import { Input } from "@/app/components/ui/input";
import { CommunitiesSidebar } from "@/app/components/CommunitiesSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
// import { InvitationsList } from "@/app/components/InvitationsList";
import { ItemsGrid } from "@/app/components/ItemCard";
import {
  searchCommunityItems,
  Item,
  getUserAccessibleItems,
  createPersonalItem,
} from "@/lib/items";
import { CreateNewItemForm } from "@/components/CreateNewItemForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function App(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [createItemError, setCreateItemError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { session, user, error } = await getCurrentSession();

        if (error || !session || !user) {
          // User is not authenticated, redirect to login
          router.push("/login");
        } else {
          // User is authenticated
          setUser(user);

          // Fetch user communities
          const { communities: userCommunities, error: communitiesError } =
            await getUserCommunities(user.id);
          if (!communitiesError && userCommunities) {
            setCommunities(userCommunities);
          }

          // Fetch user invitations
          setLoadingInvitations(true);
          try {
            const { invitations: userInvitations, error: invitationsError } =
              await getUserInvitations(user.email || "");

            if (!invitationsError && userInvitations) {
              setInvitations(userInvitations);
            }
          } catch (invErr) {
            console.error("Error fetching invitations:", invErr);
          } finally {
            setLoadingInvitations(false);
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  // const handleInvitationResponded = (
  //   invitationId: string,
  //   accepted: boolean
  // ) => {
  //   // Remove the invitation from the list
  //   setInvitations(invitations.filter((inv) => inv.id !== invitationId));

  //   // If accepted, refresh the communities list
  //   if (accepted) {
  //     refreshCommunities();
  //   }
  // };

  // Function to refresh the list of communities
  const refreshCommunities = async () => {
    if (!user) return;

    try {
      const { communities: updatedCommunities, error } =
        await getUserCommunities(user.id);
      if (error) {
        console.error("Error refreshing communities:", error);
        return;
      }

      if (updatedCommunities) {
        setCommunities(updatedCommunities);
      }
    } catch (error) {
      console.error("Unexpected error refreshing communities:", error);
    }
  };

  // Add search handler
  const handleSearch = async () => {
    if (!user) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      if (!searchQuery.trim()) {
        const { items: foundItems, error } = await getUserAccessibleItems(
          user.id
        );

        if (error) {
          console.error("Error searching items:", error);
          setSearchError(error);
          return;
        }

        setSearchResults(foundItems || []);
      } else {
        const { items: foundItems, error } = await searchCommunityItems(
          user.id,
          searchQuery
        );

        if (error) {
          console.error("Error searching items:", error);
          setSearchError(error);
          return;
        }

        setSearchResults(foundItems || []);
      }
    } catch (err) {
      console.error("Unexpected error searching items:", err);
      setSearchError(
        err instanceof Error ? err.message : "Failed to search items"
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Add debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <>
      <CommunitiesSidebar
        communities={communities}
        user={user!}
        onCommunityCreated={(community) =>
          setCommunities([...communities, community])
        }
      />

      <SidebarInset>
        {/* {!loadingInvitations && invitations.length > 0 && (
          <InvitationsList
            invitations={invitations}
            user={user!}
            onInvitationResponded={handleInvitationResponded}
          />
        )} */}
        <SidebarTrigger className="md:hidden" />

        <div className="flex flex-col items-center px-4 py-8">
          <h1 className="text-2xl font-semibold mb-2">
            Hey there,{" "}
            {user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "friend"}
          </h1>
          <p className="text-gray-500 mb-6">What are you looking for today?</p>
          <div className="w-full max-w-2xl mb-8">
            <Input
              type="search"
              placeholder="Search items across your communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Items</h2>
              <Dialog
                open={isCreateItemDialogOpen}
                onOpenChange={setIsCreateItemDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Create Item</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Create a new item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your inventory
                    </DialogDescription>
                  </DialogHeader>
                  <CreateNewItemForm
                    onSubmit={async (itemData) => {
                      if (!user) {
                        setCreateItemError(
                          "You must be logged in to create an item"
                        );
                        return;
                      }

                      setIsCreatingItem(true);
                      setCreateItemError(null);

                      try {
                        const { item, error } = await createPersonalItem(
                          itemData,
                          user
                        );

                        if (error) {
                          setCreateItemError(error);
                          return;
                        }

                        if (item) {
                          // Refresh the items list
                          handleSearch();
                          setIsCreateItemDialogOpen(false);
                        }
                      } catch (err) {
                        setCreateItemError(
                          err instanceof Error
                            ? err.message
                            : "Failed to create item"
                        );
                      } finally {
                        setIsCreatingItem(false);
                      }
                    }}
                    isSubmitting={isCreatingItem}
                    error={createItemError || undefined}
                  />
                </DialogContent>
              </Dialog>
            </div>
            {isSearching ? (
              <div className="text-gray-500 text-center py-4">Searching...</div>
            ) : searchError ? (
              <div className="text-red-500 text-center py-4">{searchError}</div>
            ) : (
              <ItemsGrid
                items={searchResults}
                emptyMessage={
                  searchQuery
                    ? "No items found matching your search."
                    : "Start typing to search for items across your communities."
                }
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
