"use client";

import { useEffect } from "react";
import { LoginForm } from "@/app/components/login-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Page() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // User is already logged in, redirect to dashboard
      router.push("/app");
    }
  }, [isLoading, user, router]);

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

  if (user) {
    return (
      <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10">
        <div className="text-gray-500">Redirecting to dashboard...</div>
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
