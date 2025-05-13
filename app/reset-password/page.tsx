"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Extract the access token from the URL fragment
    const extractTokenFromHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash && hash.includes("access_token=")) {
          const accessTokenMatch = hash.match(/access_token=([^&]*)/);
          if (accessTokenMatch && accessTokenMatch[1]) {
            return accessTokenMatch[1];
          }
        }
      }
      return null;
    };

    const token = extractTokenFromHash();
    setAccessToken(token);

    // Always set initialization to true after checking for token
    setIsInitialized(true);

    if (!token) {
      setError({
        message:
          "Invalid or missing reset token. Please request a new password reset link.",
      });
      return;
    }

    // Set the session with the access token
    const setupSession = async () => {
      try {
        // The hash contains parameters like access_token, refresh_token, etc.
        // Supabase client can set the session from the URL hash
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error setting up session:", error);
          setError({
            message:
              "Error authenticating with reset token. Please request a new password reset link.",
            code: error.code,
          });
        }
      } catch (err) {
        console.error("Session setup error:", err);
        setError({ message: "An unexpected error occurred" });
      }
    };

    setupSession();
  }, []);

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!accessToken) {
      setError({
        message:
          "Invalid or missing reset token. Please request a new password reset link.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setError({ message: "Password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError({ message: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      // Update the password using the access token
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError({
          message: error.message || "Failed to reset password",
          code: error.code,
        });
      } else {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError({ message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            {accessToken
              ? "Enter your new password below"
              : "Missing or invalid reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialized && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error.message}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              Password reset successfully! Redirecting to login page...
            </div>
          )}

          {accessToken && (
            <form onSubmit={handlePasswordReset}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={success}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={success}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || success}
                  >
                    {isLoading ? "Processing..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center py-4">
          {/* Use a simple anchor tag for guaranteed navigation */}
          <Link href="/login" passHref>
            <Button variant="outline" className="px-6">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
