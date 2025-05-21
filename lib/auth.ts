import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type AuthError = {
  message: string;
  code?: string;
};

export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ error: AuthError | null; success: boolean }> {
  try {
    // Check if username is already taken
    const { data: existingUsernames, error: usernameCheckError } =
      await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

    if (usernameCheckError) {
      console.error("Error checking existing usernames:", usernameCheckError);
    }

    if (existingUsernames) {
      return {
        error: { message: "This username is already taken" },
        success: false,
      };
    }

    // Attempt to create the user - our database trigger will create the profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return {
        error: {
          message: error.message || "Failed to create account",
          code: error.code,
        },
        success: false,
      };
    }

    // Check if user already exists by examining the identities array
    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      return {
        error: { message: "A user with this email already exists" },
        success: false,
      };
    }

    return { error: null, success: true };
  } catch (err) {
    console.error("Signup error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{
  error: AuthError | null;
  success: boolean;
}> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: {
          message: error.message || "Failed to sign in",
          code: error.code,
        },
        success: false,
      };
    }

    return { error: null, success: true };
  } catch (err) {
    console.error("Sign in error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}

export async function signOut(): Promise<{
  error: AuthError | null;
  success: boolean;
}> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: {
          message: error.message || "Failed to sign out",
          code: error.code,
        },
        success: false,
      };
    }

    // Navigate to login page after successful logout
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return { error: null, success: true };
  } catch (err) {
    console.error("Sign out error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}

export async function getCurrentSession(): Promise<{
  error: AuthError | null;
  user: User | null;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        error: {
          message: error.message || "Failed to get session",
          code: error.code,
        },
        user: null,
      };
    }

    return {
      error: null,
      user: data.session?.user || null,
    };
  } catch (err) {
    console.error("Get session error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      user: null,
    };
  }
}

export async function resetPassword(
  email: string,
  redirectTo?: string
): Promise<{
  error: AuthError | null;
  success: boolean;
}> {
  try {
    // Get the site URL for the reset password link
    let siteUrl = "";
    if (typeof window !== "undefined") {
      siteUrl = window.location.origin;
    } else {
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    }

    const resetRedirectTo = redirectTo || `${siteUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectTo,
    });

    if (error) {
      return {
        error: {
          message:
            error.message || "Failed to send password reset instructions",
          code: error.code,
        },
        success: false,
      };
    }

    return { error: null, success: true };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}
