import { Community } from "@/lib/communities";
import Link from "next/link";

import { cn } from "@/utils/utils";

interface CommunityCardProps {
  community: Community;
  className?: string;
}

/**
 * A reusable card component for displaying community information
 */
export function CommunityCard({
  community,
  className = "",
}: CommunityCardProps) {
  return (
    <Link
      href={`/app/community/${community.id}`}
      className={cn(
        "rounded-lg block bg-white hover:bg-blue-50 border  p-4 hover:shadow-md cursor-pointer transition-all",
        className
      )}
      tabIndex={0}
    >
      <h3 className="font-semibold">{community.name}</h3>
      {community.description && (
        <p className="text-gray-600 text-sm mt-1">{community.description}</p>
      )}
    </Link>
  );
}

interface CommunitiesGridProps {
  communities: Community[];
  emptyMessage: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

/**
 * A grid layout for displaying multiple communities
 */
export function CommunitiesGrid({
  communities,
  emptyMessage,
  actionButton,
  className = "",
}: CommunitiesGridProps) {
  if (communities.length === 0) {
    return (
      <div className="border border-blue-100 rounded-lg p-6 mb-8 text-center">
        {emptyMessage}
        {actionButton && <div className="mt-6">{actionButton}</div>}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}
