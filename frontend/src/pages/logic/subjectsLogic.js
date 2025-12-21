import { initCourses } from "./coursesLogic.js";

// Legacy adapter: unify Subjects UI into Courses page.
export async function initSubjects(container) {
  // Just reuse the courses page implementation so links to /subjects continue to work
  await initCourses(container);
}

