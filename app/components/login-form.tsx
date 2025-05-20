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
import { signUp, signIn, resetPassword, AuthError } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";

type FormView = "login" | "signup" | "reset";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formViewParam = searchParams.get("view");

  const [formView, setFormView] = useState<FormView>(
    formViewParam === "signup" ? "signup" : "login"
  );

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
      if (formView === "signup") {
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
          setFormView("login");
        }
      } else if (formView === "login") {
        // Handle login
        const result = await signIn(email, password);

        if (result.error) {
          setError(result.error);
        } else {
          // Login successful, redirect to dashboard or home page
          setFormSuccess("Login successful!");
          router.push("/app"); // Update this to your desired redirect path
        }
      } else if (formView === "reset") {
        // Handle password reset
        if (!email.trim()) {
          setError({ message: "Email is required" });
          setIsLoading(false);
          return;
        }

        const result = await resetPassword(email);

        if (result.error) {
          setError(result.error);
        } else {
          setFormSuccess(
            "Password reset instructions have been sent to your email."
          );
          setEmail("");
        }
      }
    } catch (err) {
      console.error("Error during form submission:", err);
      setError({ message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setError(null);
    setFormSuccess(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {formView === "login"
              ? "Login to your account"
              : formView === "signup"
              ? "Create an account"
              : "Reset your password"}
          </CardTitle>
          <CardDescription>
            {formView === "login"
              ? "Enter your email below to login to your account"
              : formView === "signup"
              ? "Fill in your details to create a new account"
              : "Enter your email and we'll send you instructions to reset your password"}
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
              {formView === "signup" && (
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
              {formView !== "reset" && (
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {formView === "login" && (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setFormView("reset");
                          resetForm();
                        }}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Button>
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
              )}
              {formView === "signup" && (
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
                  {isLoading
                    ? "Processing..."
                    : formView === "login"
                    ? "Login"
                    : formView === "signup"
                    ? "Sign Up"
                    : "Send Reset Link"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {formView === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setFormView("signup");
                      resetForm();
                    }}
                  >
                    Sign up
                  </Button>
                </>
              ) : formView === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setFormView("login");
                      resetForm();
                    }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                <>
                  Remember your password?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setFormView("login");
                      resetForm();
                    }}
                  >
                    Back to login
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
