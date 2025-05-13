"use client";
import { getCurrentSession, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

export default function App(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Logged in!</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.email}</p>

      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="outline"
        className="mt-4"
      >
        {isLoggingOut ? "Logging out..." : "Log out"}
      </Button>
    </div>
  );
}
