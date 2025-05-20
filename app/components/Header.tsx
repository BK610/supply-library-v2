"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

export default function Header(): React.ReactElement {
  const { user, isLoading, error } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Handle navigation after logout
  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.push("/login");
    }
  }, [isLoading, user, isLoggingOut, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error, success } = await signOut();

      if (error) {
        console.error("Logout error:", error);
      }
      // Note: We don't need to manually navigate here
      // The useEffect will handle navigation when auth state changes
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b py-4 h-18">
      <div className="h-full max-w-none lg:max-w-10/12 mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-medium">Supply Library</h1>
        </Link>
        <nav>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
          ) : error ? (
            <div className="text-red-500 text-sm">Authentication error</div>
          ) : user ? (
            <>
              <Link href="/app">
                <Button variant="outline" className="mr-2">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="mr-2">
                  Log in
                </Button>
              </Link>
              <Link href="/login?view=signup">
                <Button>Join us</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
