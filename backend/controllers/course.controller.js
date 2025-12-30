import * as CourseService from "../services/course.service.js";

export async function getCourses(req, res) {
  try {
    const courses = await CourseService.fetchAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
}

export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await CourseService.fetchCourseById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch course", error: err.message });
  }
}

export async function createCourse(req, res) {
  try {
    const { name, description, teacher_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const role = req.user?.role?.toLowerCase() || "";
    const teacherId = ["teacher", "guru"].includes(role)
      ? req.user.id
      : teacher_id || req.user?.id;

    if (!teacherId) {
      return res.status(400).json({ message: "teacher_id is required" });
    }

    const courseId = await CourseService.createNewCourse(name, description, teacherId);
    const course = await CourseService.fetchCourseById(courseId);

    res.status(201).json({
      message: "Course created successfully",
      course
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create course", error: err.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await CourseService.fetchCourseById(id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }

    const role = req.user?.role?.toLowerCase() || "";
    if (["teacher", "guru"].includes(role) && existing.teacher_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const success = await CourseService.updateExistingCourse(id, name, description);
    if (!success) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course = await CourseService.fetchCourseById(id);
    res.json({ message: "Course updated successfully", course });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    const existing = await CourseService.fetchCourseById(id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }

    const role = req.user?.role?.toLowerCase() || "";
    if (["teacher", "guru"].includes(role) && existing.teacher_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const success = await CourseService.deleteExistingCourse(id);
    if (!success) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
}
