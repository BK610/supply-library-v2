"use client";
import { cn } from "@/utils/utils";
import { useState, FormEvent } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { signUp, signIn, AuthError } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFormSuccess(null);
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Basic validation for signup
        if (!username.trim()) {
          setError({ message: "Username is required" });
          setIsLoading(false);
          return;
        }

        if (!email.trim()) {
          setError({ message: "Email is required" });
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError({ message: "Passwords do not match" });
          setIsLoading(false);
          return;
        }

        // Process sign up
        const result = await signUp(email, password, username);

        if (result.error) {
          setError(result.error);
        } else {
          // Success - clear form and show success message
          setFormSuccess(
            "Account created successfully! Please check your email to confirm your account before logging in."
          );
          // Reset form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setUsername("");
          // Switch to login form after signup success
          setIsLogin(true);
        }
      } else {
        // Handle login
        const result = await signIn(email, password);

        if (result.error) {
          setError(result.error);
        } else {
          // Login successful, redirect to dashboard or home page
          setFormSuccess("Login successful!");
          router.push("/app"); // Update this to your desired redirect path
        }
      }
    } catch (err) {
      console.error(
        isLogin ? "Error during login:" : "Error during signup:",
        err
      );
      setError({ message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isLogin ? "Login to your account" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your email below to login to your account"
              : "Fill in your details to create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error.message}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                </Button>
                {/* <Button variant="outline" className="w-full">
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormSuccess(null);
                }}
                className="underline underline-offset-4 text-primary"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
