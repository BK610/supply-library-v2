"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/app/components/login-form";
import { getCurrentSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { user } = await getCurrentSession();

        if (user) {
          // User is already logged in, redirect to dashboard
          router.push("/app");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm text-center">
          <div className="h-8 w-full bg-gray-100 animate-pulse rounded-md mb-4"></div>
          <div className="h-8 w-3/4 mx-auto bg-gray-100 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
