import { supabase } from "../config/supabase";

/**
 * Sign up a new user with email and password
 */
export async function signup(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

/**
 * Log in with email and password
 */
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

/**
 * Log out current user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Get current logged-in user (or null if not logged in)
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error("Error fetching current user:", err);
    return null;
  }
}

/**
 * Get current session (persists across app restarts)
 */
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error("Error fetching session:", err);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
  return subscription;
}
