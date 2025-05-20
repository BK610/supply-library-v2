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
import { InvitationsList } from "@/app/components/InvitationsList";
import { ItemsGrid } from "@/app/components/ItemCard";

export default function App(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="flex h-full">
      <CommunitiesSidebar
        communities={communities}
        user={user!}
        onCommunityCreated={(community) =>
          setCommunities([...communities, community])
        }
      />

      <div className="flex-1 p-6">
        {!loadingInvitations && invitations.length > 0 && (
          <InvitationsList
            invitations={invitations}
            user={user!}
            onInvitationResponded={handleInvitationResponded}
          />
        )}

        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search items across your communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-2xl"
          />
        </div>

        {/* TODO: Implement search results and recent items */}
        <div className="text-gray-500 text-center py-8">
          Search functionality coming soon...
        </div>
      </div>
    </div>
  );
}
