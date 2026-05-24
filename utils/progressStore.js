import { subjects } from "../data/curriculum";
import * as supabaseService from "../src/services/supabase";

// ── Year standing thresholds (based on units passed) ──────────────────────
const YEAR_STANDING = {
  1: 0,
  2: 50,
  3: 121,
};

export function getUnitsPassed(progress) {
  return Object.entries(progress)
    .filter(([, status]) => status === "passed")
    .reduce((total, [key]) => total + (subjects[key]?.units ?? 0), 0);
}

export function getTotalUnits() {
  return Object.values(subjects).reduce((total, s) => total + (s.units ?? 0), 0);
}

export function getYearStanding(progress) {
  const units = getUnitsPassed(progress);
  if (units >= YEAR_STANDING[3]) return 3;
  if (units >= YEAR_STANDING[2]) return 2;
  return 1;
}

function isYearStandingReq(prereq) {
  return typeof prereq === "string" && prereq.toUpperCase().includes("STANDING");
}

function getRequiredYear(prereqStr) {
  if (prereqStr.includes("3")) return 3;
  if (prereqStr.includes("2")) return 2;
  return 1;
}

export async function getProgress(userId) {
  try {
    if (!userId) { console.warn("getProgress called without userId"); return {}; }
    const { progress, error } = await supabaseService.fetchUserProgress(userId);
    if (error) { console.error("Failed to fetch progress:", error); return {}; }
    return progress;
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
}

export async function saveProgress(userId, progress) {
  try {
    if (!userId) { console.warn("saveProgress called without userId"); return; }
    const updates = {};
    for (const [key, status] of Object.entries(progress)) {
      if (status && status !== "locked") updates[key] = status;
    }
    if (Object.keys(updates).length > 0) {
      await supabaseService.updateMultipleSubjectStatuses(userId, updates);
    }
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

export async function saveSubjectStatus(userId, subjectKey, subjectName, status) {
  try {
    if (!userId) { console.warn("saveSubjectStatus called without userId"); return; }
    if (status === "locked") {
      await supabaseService.deleteSubjectStatus(userId, subjectKey);
    } else {
      await supabaseService.updateSubjectStatus(userId, subjectKey, subjectName, status);
    }
  } catch (e) {
    console.error("Failed to save subject status", e);
  }
}

export function getSubjectStatus(subjectKey, progress) {
  if (progress[subjectKey]) return progress[subjectKey];
  const subject = subjects[subjectKey];
  if (!subject) return "locked";
  const yearStanding = getYearStanding(progress);
  const allPrereqsPassed = subject.prerequisites.every((prereq) => {
    if (isYearStandingReq(prereq)) return yearStanding >= getRequiredYear(prereq);
    return progress[prereq] === "passed";
  });
  return allPrereqsPassed ? "available" : "locked";
}

export function computeAllStatuses(progress) {
  const statuses = {};
  for (const key of Object.keys(subjects)) {
    statuses[key] = getSubjectStatus(key, progress);
  }
  return statuses;
}

export function cascadeFailure(subjectKey, progress) {
  const updated = { ...progress, [subjectKey]: "failed" };
  function lockDependents(key) {
    for (const [depKey, depSubject] of Object.entries(subjects)) {
      if (depSubject.prerequisites.includes(key)) {
        if (updated[depKey] === "enrolled" || updated[depKey] === "available") {
          updated[depKey] = undefined;
          lockDependents(depKey);
        }
      }
    }
  }
  lockDependents(subjectKey);
  return updated;
}

// Returns { code, name, isYearStanding } objects instead of just code strings
export function getMissingPrereqs(subjectKey, progress) {
  const subject = subjects[subjectKey];
  if (!subject) return [];
  const yearStanding = getYearStanding(progress);
  return subject.prerequisites
    .filter((prereq) => {
      if (isYearStandingReq(prereq)) return yearStanding < getRequiredYear(prereq);
      return progress[prereq] !== "passed";
    })
    .map((prereq) => {
      if (isYearStandingReq(prereq)) {
        const requiredYear = getRequiredYear(prereq);
        const needed = YEAR_STANDING[requiredYear];
        const current = getUnitsPassed(progress);
        return { code: prereq, name: `Need ${needed} units passed (you have ${current})`, isYearStanding: true };
      }
      return { code: subjects[prereq]?.code ?? prereq, name: subjects[prereq]?.name ?? "", isYearStanding: false };
    });
}

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
    unitsPassed: getUnitsPassed(progress),
    totalUnits: getTotalUnits(),
    yearStanding: getYearStanding(progress),
  };
}
