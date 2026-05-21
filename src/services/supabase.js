import { supabase } from "../config/supabase";

async function getAuthId() {
  const {data: userData} = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("User not authenticated");
    }
    return userData.user.id;
}
/**
 * Fetch all progress records for a user
 * Returns object: { subjectKey: status, ... }
 */
export async function fetchUserProgress(userId) {
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("subject_code, status")
      .eq("user_id", userId);

    if (error) throw error;

    // Convert array to object: { subjectKey: status }
    const progress = {};
    data.forEach((row) => {
      progress[row.subject_code] = row.status;
    });

    return { progress, error: null };
  } catch (err) {
    console.error("Error fetching user progress:", err);
    return { progress: {}, error: err.message };
  }
}

/**
 * Update or insert a single subject status for a user
 */
export async function updateSubjectStatus(userId, subjectKey, subjectName, status) {
  try {
    
    const uid = await getAuthId();
    const { data, error } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: uid,
          subject_code: subjectKey,
          subject_name: subjectName,
          status,
          updated_at: new Date().toISOString(),
        },
        // { onConflict: "user_id,subject_code" }
      )
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error updating subject status:", err);
    return { data: null, error: err.message };
  }
}

/**
 * Delete a progress record (reverts to computed status)
 */
export async function deleteSubjectStatus(userId, subjectKey) {
  try {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", userId)
      .eq("subject_code", subjectKey);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error("Error deleting subject status:", err);
    return { error: err.message };
  }
}

/**
 * Clear all progress for a user (reset)
 */
export async function clearAllProgress(userId) {
  try {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error("Error clearing progress:", err);
    return { error: err.message };
  }
}

/**
 * Batch update multiple subject statuses
 */
export async function updateMultipleSubjectStatuses(userId, updates) {
  try {
    const uid = await getAuthId();
    const rows = Object.entries(updates).map(([subjectKey, status]) => ({
      user_id: uid,
      subject_code: subjectKey,
      status,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("user_progress")
      .upsert(rows, 
        // { onConflict: "user_id,subject_code" }
      )
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error batch updating subject statuses:", err);
    return { data: null, error: err.message };
  }
}
