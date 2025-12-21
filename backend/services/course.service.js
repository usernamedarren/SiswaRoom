import * as CourseModel from "../models/course.models.js";

export async function fetchAllCourses() {
  return await CourseModel.getAllCourses();
}

export async function fetchCourseById(id) {
  return await CourseModel.getCourseById(id);
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
