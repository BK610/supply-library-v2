import React, { useState } from "react";
import { Invitation, respondToInvitation } from "@/lib/communities";
import { Button } from "@/app/components/ui/button";
import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";

interface InvitationsListProps {
  invitations: Invitation[];
  user: User;
  onInvitationResponded: (invitationId: string, accepted: boolean) => void;
}

export function InvitationsList({
  invitations,
  user,
  onInvitationResponded,
}: InvitationsListProps) {
  const [respondingInvitations, setRespondingInvitations] = useState<{
    [key: string]: boolean;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (invitations.length === 0) {
    return null;
  }

  const handleRespondToInvitation = async (
    invitationId: string,
    accept: boolean
  ) => {
    // Mark this invitation as being processed
    setRespondingInvitations((prev) => ({
      ...prev,
      [invitationId]: true,
    }));

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, [invitationId]: "" }));

    try {
      const { success, error } = await respondToInvitation(
        invitationId,
        user.id,
        accept
      );

      if (error) {
        setErrors((prev) => ({ ...prev, [invitationId]: error }));
        return;
      }

      if (success) {
        // Notify parent component that the invitation has been responded to
        onInvitationResponded(invitationId, accept);
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [invitationId]: err?.message || "Failed to respond to invitation",
      }));
    } finally {
      // Reset the processing state
      setRespondingInvitations((prev) => ({
        ...prev,
        [invitationId]: false,
      }));
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-semibold">Community Invitations</h2>
      <div className="grid gap-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardHeader className="pb-2">
              <CardTitle>{invitation.community?.name}</CardTitle>
              <CardDescription>
                You've been invited to join this community
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={invitation.inviter?.avatar_url || undefined}
                    alt={invitation.inviter?.username}
                  />
                  <AvatarFallback>
                    {invitation.inviter?.username?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    Invited by{" "}
                    <span className="font-medium">
                      {invitation.inviter?.username}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {errors[invitation.id] && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm">
                  {errors[invitation.id]}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespondToInvitation(invitation.id, false)}
                disabled={respondingInvitations[invitation.id]}
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleRespondToInvitation(invitation.id, true)}
                disabled={respondingInvitations[invitation.id]}
              >
                {respondingInvitations[invitation.id] ? "Joining..." : "Accept"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
