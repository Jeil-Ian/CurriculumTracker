import { subjects } from "../data/curriculum";
import * as supabaseService from "../src/services/supabase";

// Load saved progress from Supabase for a specific user
export async function getProgress(userId) {
  try {
    if (!userId) {
      console.warn("getProgress called without userId");
      return {};
    }
    const { progress, error } = await supabaseService.fetchUserProgress(userId);
    if (error) {
      console.error("Failed to fetch progress from Supabase:", error);
      return {};
    }
    return progress;
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
}

// Save progress to Supabase for a specific user
// This now takes full progress object and upserts all changes
export async function saveProgress(userId, progress) {
  try {
    if (!userId) {
      console.warn("saveProgress called without userId");
      return;
    }
    // Only upsert the records that have explicit statuses (not computed ones)
    const updates = {};
    for (const [key, status] of Object.entries(progress)) {
      if (status && status !== "locked") {
        updates[key] = status;
      }
    }
    if (Object.keys(updates).length > 0) {
      await supabaseService.updateMultipleSubjectStatuses(userId, updates);
    }
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

// Save a single subject status to Supabase
export async function saveSubjectStatus(userId, subjectKey, subjectName, status) {
  try {
    if (!userId) {
      console.warn("saveSubjectStatus called without userId");
      return; 
    }
    if (status === "locked") {
      // Don't store "locked" status; delete the record to revert to computed
      await supabaseService.deleteSubjectStatus(userId, subjectKey);
    } else {
      await supabaseService.updateSubjectStatus(
      userId,
      subjectKey,
      subjectName,
      status
    );
    }
  } catch (e) {
    console.error("Failed to save subject status", e);
  }
}

// Get the computed status of a single subject
export function getSubjectStatus(subjectKey, progress) {
  // If student has manually set a status, use it
  if (progress[subjectKey]) return progress[subjectKey];

  const subject = subjects[subjectKey];
  if (!subject) return "locked";

  // Check if all prerequisites are passed
  const allPrereqsPassed = subject.prerequisites.every(
    (prereq) => progress[prereq] === "passed"
  );

  return allPrereqsPassed ? "available" : "locked";
}

// Compute statuses for ALL subjects at once
export function computeAllStatuses(progress) {
  const statuses = {};
  for (const key of Object.keys(subjects)) {
    statuses[key] = getSubjectStatus(key, progress);
  }
  return statuses;
}

// When a subject is marked failed, cascade-lock its dependents
export function cascadeFailure(subjectKey, progress) {
  const updated = { ...progress, [subjectKey]: "failed" };

  function lockDependents(key) {
    for (const [depKey, depSubject] of Object.entries(subjects)) {
      if (depSubject.prerequisites.includes(key)) {
        // Only lock if it was enrolled or available (don't touch passed ones
        // unless they also lose their prereqs)
        if (updated[depKey] === "enrolled" || updated[depKey] === "available") {
          updated[depKey] = undefined; // revert to computed (locked)
          lockDependents(depKey); // recurse
        }
      }
    }
  }

  lockDependents(subjectKey);
  return updated;
}

// Get a human-readable list of missing prerequisites for a subject
export function getMissingPrereqs(subjectKey, progress) {
  const subject = subjects[subjectKey];
  if (!subject) return [];
  return subject.prerequisites
    .filter((prereq) => progress[prereq] !== "passed")
    .map((prereq) => subjects[prereq]?.code ?? prereq);
}

// Summary stats
export function getProgressSummary(progress) {
  const allKeys = Object.keys(subjects);
  const statuses = computeAllStatuses(progress);
  return {
    total: allKeys.length,
    passed: allKeys.filter((k) => statuses[k] === "passed").length,
    enrolled: allKeys.filter((k) => statuses[k] === "enrolled").length,
    failed: allKeys.filter((k) => statuses[k] === "failed").length,
    available: allKeys.filter((k) => statuses[k] === "available").length,
    locked: allKeys.filter((k) => statuses[k] === "locked").length,
  };
}