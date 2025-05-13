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
    // First check if the email is already in use via auth
    const { error: emailCheckError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Don't create a user, just check if email exists
      },
    });

    // If there's no error when trying with OTP for a non-existent user, it means email exists
    if (!emailCheckError) {
      return {
        error: { message: "A user with this email already exists" },
        success: false,
      };
    }

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
    const { error } = await supabase.auth.signUp({
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

    return { error: null, success: true };
  } catch (err) {
    console.error("Signup error:", err);
    return {
      error: { message: "An unexpected error occurred" },
      success: false,
    };
  }
}
