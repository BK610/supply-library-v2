"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { getCurrentSession, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header(): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session using our auth wrapper
    async function checkAuth() {
      try {
        const { user } = await getCurrentSession();
        setIsLoggedIn(!!user);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      // Use our auth wrapper to maintain consistency
      const { user } = await getCurrentSession();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error, success } = await signOut();

      if (success) {
        setIsLoggedIn(false);
        router.push("/");
      } else if (error) {
        console.error("Logout error:", error);
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-medium">Supply Library</h1>
        </Link>
        <nav>
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-100 animate-pulse rounded"></div>
          ) : isLoggedIn ? (
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
