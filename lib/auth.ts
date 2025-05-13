import { supabase } from "@/lib/supabase";

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
    // An empty identities array indicates the email is already registered
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
  session: any | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
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
        session: null,
      };
    }

    return {
      error: null,
      success: true,
      session: data.session,
    };
  } catch (err) {
    console.error("Sign in error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
      session: null,
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

    return { error: null, success: true };
  } catch (err) {
    console.error("Sign out error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        error: {
          message: error.message || "Failed to get session",
          code: error.code,
        },
        session: null,
        user: null,
      };
    }

    return {
      error: null,
      session: data.session,
      user: data.session?.user || null,
    };
  } catch (err) {
    console.error("Get session error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      session: null,
      user: null,
    };
  }
}
