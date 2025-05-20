"use client";

import { Button } from "@/app/components/ui/button";
import { Community } from "@/lib/communities";
import { Sidebar, SidebarProvider } from "@/app/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ChangeEvent, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createCommunity } from "@/lib/communities";
import { CommunityCard } from "@/app/components/CommunityCard";

interface CommunitiesSidebarProps {
  communities: Community[];
  user: User;
  onCommunityCreated: (community: Community) => void;
}

export function CommunitiesSidebar({
  communities,
  user,
  onCommunityCreated,
}: CommunitiesSidebarProps) {
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [createCommunityError, setCreateCommunityError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateCommunity = async () => {
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
        onCommunityCreated(community);
        setNewCommunityName("");
        setNewCommunityDescription("");
        setIsDialogOpen(false);
      }
    } catch (error: unknown) {
      console.error("Unexpected error creating community:", error);
      setCreateCommunityError(
        error instanceof Error ? error.message : "Failed to create community"
      );
    } finally {
      setIsCreatingCommunity(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="w-64 border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Communities</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4">Create a community</Button>
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

          <div className="space-y-2">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                className="hover:bg-gray-50"
              />
            ))}
          </div>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
