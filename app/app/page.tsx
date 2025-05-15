"use client";
import { getCurrentSession, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { User } from "@supabase/supabase-js";
import {
  getUserCommunities,
  createCommunity,
  Community,
  getUserInvitations,
  Invitation,
} from "@/lib/communities";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { CommunitiesGrid } from "@/app/components/CommunityCard";
import { InvitationsList } from "@/app/components/InvitationsList";

export default function App(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [createCommunityError, setCreateCommunityError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

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
          const { communities, error: communitiesError } =
            await getUserCommunities(user.id);
          if (!communitiesError && communities) {
            setCommunities(communities);
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error, success } = await signOut();

      if (error) {
        console.error("Error logging out:", error);
        setIsLoggingOut(false);
        return;
      }

      if (success) {
        // Redirect to login page after successful logout
        router.push("/login");
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      setIsLoggingOut(false);
    }
  };

  const handleInvitationResponded = (
    invitationId: string,
    accepted: boolean
  ) => {
    // Remove the invitation from the list
    setInvitations(invitations.filter((inv) => inv.id !== invitationId));

    // If accepted, refresh the communities list
    if (accepted) {
      refreshCommunities();
    }
  };

  const handleCreateCommunity = async () => {
    if (!user) {
      setCreateCommunityError("You must be logged in to create a community");
      return;
    }

    if (!newCommunityName.trim()) {
      setCreateCommunityError("Community name is required");
      return;
    }

    setIsCreatingCommunity(true);
    setCreateCommunityError("");

    try {
      const { community, error } = await createCommunity(
        newCommunityName,
        user,
        newCommunityDescription || undefined
      );

      if (error) {
        console.error("Error creating community:", error);
        setCreateCommunityError(error);
        setIsCreatingCommunity(false);
        return;
      }

      if (community) {
        // Add the new community to state
        setCommunities([...communities, community]);

        // Reset form
        setNewCommunityName("");
        setNewCommunityDescription("");
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Unexpected error creating community:", error);
      setCreateCommunityError(error?.message || "Failed to create community");
    } finally {
      setIsCreatingCommunity(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Create Community dialog contents
  const createCommunityDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Create a community</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new community</DialogTitle>
          <DialogDescription>
            Create a community to organize and share items with others.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Community name</Label>
            <Input
              id="name"
              value={newCommunityName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewCommunityName(e.target.value)
              }
              placeholder="Enter community name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={newCommunityDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNewCommunityDescription(e.target.value)
              }
              placeholder="What is this community about?"
            />
          </div>

          {createCommunityError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {createCommunityError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCommunity}
            disabled={isCreatingCommunity}
          >
            {isCreatingCommunity ? "Creating..." : "Create community"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            size="sm"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>

        <div className="mb-8">
          <p className="text-gray-600">Welcome, {user?.email}</p>
        </div>

        {!loadingInvitations && invitations.length > 0 && (
          <InvitationsList
            invitations={invitations}
            user={user!}
            onInvitationResponded={handleInvitationResponded}
          />
        )}

        {communities.length === 0 ? (
          <CommunitiesGrid
            communities={[]}
            emptyMessage={
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  You&apos;re not part of any communities yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Communities let you organize and share items with others.
                  Create your own community or join an existing one to get
                  started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {createCommunityDialog}
                  <Button variant="outline" disabled>
                    Join a community
                  </Button>
                </div>
              </div>
            }
          />
        ) : (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Communities</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Create new community</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new community</DialogTitle>
                    <DialogDescription>
                      Create a community to organize and share items with
                      others.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name-existing">Community name</Label>
                      <Input
                        id="name-existing"
                        value={newCommunityName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setNewCommunityName(e.target.value)
                        }
                        placeholder="Enter community name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description-existing">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description-existing"
                        value={newCommunityDescription}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setNewCommunityDescription(e.target.value)
                        }
                        placeholder="What is this community about?"
                      />
                    </div>

                    {createCommunityError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        {createCommunityError}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCommunity}
                      disabled={isCreatingCommunity}
                    >
                      {isCreatingCommunity ? "Creating..." : "Create community"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <CommunitiesGrid communities={communities} emptyMessage={null} />
          </div>
        )}
      </div>
    </div>
  );
}
