import * as CourseModel from "../models/course.models.js";

export async function fetchAllCourses() {
  const rows = await CourseModel.getAllCourses();
  return rows.map((course) => ({
    ...course,
    course_id: `course-${course.id}`,
    course_name: course.name,
    teacher_name: course.teacher_name || course.teacher || undefined,
  }));
}

export async function fetchCourseById(id) {
  const numericId = typeof id === "string" && id.startsWith("course-")
    ? id.replace("course-", "")
    : id;
  const course = await CourseModel.getCourseById(numericId);
  if (!course) return null;
  return {
    ...course,
    course_id: `course-${course.id}`,
    course_name: course.name,
    teacher_name: course.teacher_name || course.teacher || undefined,
  };
}

export async function fetchCoursesByTeacher(teacherId) {
  return await CourseModel.getCoursesByTeacher(teacherId);
}

export async function createNewCourse(name, description, teacherId) {
  return await CourseModel.createCourse(name, description, teacherId);
}

export async function updateExistingCourse(id, name, description) {
  return await CourseModel.updateCourse(id, name, description);
}

export async function deleteExistingCourse(id) {
  return await CourseModel.deleteCourse(id);
}
