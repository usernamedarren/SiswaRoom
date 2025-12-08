-- SiswaRoom Complete Database Schema
-- Version: 1.0
-- Last Updated: December 9, 2025

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- =====================================================
-- Table: users
-- =====================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','teacher','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `bio`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'admin', 'Administrator SiswaRoom', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(2, 'Ibu Siti Nurhaliza', 'teacher1@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'teacher', 'Guru Matematika dan IPA', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(3, 'Pak Budi Hartanto', 'teacher2@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'teacher', 'Guru Bahasa Indonesia', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(4, 'Ahmad Rasyid', 'student1@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'student', 'Siswa Kelas 7A', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(5, 'Siti Aisyah', 'student2@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'student', 'Siswa Kelas 7B', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(6, 'Budi Santoso', 'student3@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'student', 'Siswa Kelas 8A', '2025-12-08 14:48:36', '2025-12-08 14:48:36'),
(7, 'Rini Lestari', 'student4@siswaroom.com', '$2a$10$/.0Z1cuNLljvg1.77bp6zO7RnT6H22zaa9pDz15vbFbYm98PqU3aq', 'student', 'Siswa Kelas 8B', '2025-12-08 14:48:36', '2025-12-08 14:48:36');

-- =====================================================
-- Table: subjects
-- =====================================================
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `teacher_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subjects` (`id`, `name`, `description`, `teacher_id`, `created_at`) VALUES
(1, 'Matematika', 'Pembelajaran Matematika Kelas 7-8', 2, '2025-12-08 14:48:36'),
(2, 'Bahasa Indonesia', 'Pembelajaran Bahasa Indonesia Kelas 7-8', 3, '2025-12-08 14:48:36'),
(3, 'IPA', 'Pembelajaran IPA (Fisika, Kimia, Biologi)', 2, '2025-12-08 14:48:36'),
(4, 'Bahasa Inggris', 'Pembelajaran Bahasa Inggris Kelas 7-8', 2, '2025-12-08 14:48:36'),
(5, 'PKn', 'Pendidikan Kewarganegaraan', 3, '2025-12-08 14:48:36');

-- =====================================================
-- Table: courses (user_courses via join table)
-- =====================================================
DROP TABLE IF EXISTS `user_courses`;
CREATE TABLE `user_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive','completed') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course` (`user_id`, `course_id`),
  KEY `fk_user_id` (`user_id`),
  KEY `fk_course_id` (`course_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_id` FOREIGN KEY (`course_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_courses` (`user_id`, `course_id`, `enrolled_date`, `status`) VALUES
(4, 1, '2025-12-08 14:48:36', 'active'),
(4, 2, '2025-12-08 14:48:36', 'active'),
(4, 3, '2025-12-08 14:48:36', 'active'),
(5, 1, '2025-12-08 14:48:36', 'active'),
(5, 2, '2025-12-08 14:48:36', 'active'),
(5, 4, '2025-12-08 14:48:36', 'active'),
(6, 1, '2025-12-08 14:48:36', 'active'),
(6, 3, '2025-12-08 14:48:36', 'active'),
(7, 2, '2025-12-08 14:48:36', 'active'),
(7, 4, '2025-12-08 14:48:36', 'active');

-- =====================================================
-- Table: schedules
-- =====================================================
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `room` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_schedule_subject` (`subject_id`),
  KEY `fk_schedule_teacher` (`teacher_id`),
  KEY `idx_day_time` (`day`, `start_time`),
  CONSTRAINT `fk_schedule_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `schedules` (`subject_id`, `teacher_id`, `room`, `day`, `start_time`, `end_time`, `created_at`) VALUES
(1, 2, 'Ruang 101', 'Monday', '07:00:00', '08:30:00', '2025-12-08 14:48:36'),
(1, 2, 'Ruang 101', 'Wednesday', '07:00:00', '08:30:00', '2025-12-08 14:48:36'),
(1, 2, 'Ruang 101', 'Friday', '07:00:00', '08:30:00', '2025-12-08 14:48:36'),
(2, 3, 'Ruang 102', 'Tuesday', '08:30:00', '10:00:00', '2025-12-08 14:48:36'),
(2, 3, 'Ruang 102', 'Thursday', '08:30:00', '10:00:00', '2025-12-08 14:48:36'),
(3, 2, 'Lab Sains', 'Monday', '10:00:00', '11:30:00', '2025-12-08 14:48:36'),
(3, 2, 'Lab Sains', 'Wednesday', '10:00:00', '11:30:00', '2025-12-08 14:48:36'),
(4, 2, 'Ruang 103', 'Tuesday', '13:00:00', '14:30:00', '2025-12-08 14:48:36'),
(4, 2, 'Ruang 103', 'Friday', '13:00:00', '14:30:00', '2025-12-08 14:48:36'),
(5, 3, 'Ruang 104', 'Thursday', '14:30:00', '16:00:00', '2025-12-08 14:48:36');

-- =====================================================
-- Table: materials
-- =====================================================
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_material_course` (`course_id`),
  CONSTRAINT `fk_material_course` FOREIGN KEY (`course_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `materials` (`course_id`, `title`, `description`, `file_url`, `file_type`, `upload_date`) VALUES
(1, 'BAB 1: Bilangan Bulat', 'Materi pembelajaran tentang operasi bilangan bulat', '/materials/mat-ch1.pdf', 'pdf', '2025-12-08 14:48:36'),
(1, 'BAB 2: Pecahan', 'Materi pembelajaran tentang operasi pecahan', '/materials/mat-ch2.pdf', 'pdf', '2025-12-08 14:48:36'),
(2, 'BAB 1: Tata Bahasa Indonesia', 'Pengenalan tata bahasa Indonesia dasar', '/materials/bi-ch1.pdf', 'pdf', '2025-12-08 14:48:36'),
(2, 'BAB 2: Sastra Indonesia', 'Pengenalan karya sastra Indonesia', '/materials/bi-ch2.pdf', 'pdf', '2025-12-08 14:48:36'),
(3, 'BAB 1: Struktur Atom', 'Pengenalan struktur atom dan partikel dasar', '/materials/ipa-ch1.pdf', 'pdf', '2025-12-08 14:48:36'),
(4, 'Lesson 1: Present Tense', 'Grammar lesson tentang Present Tense', '/materials/en-ch1.pdf', 'pdf', '2025-12-08 14:48:36');

-- =====================================================
-- Table: quizzes
-- =====================================================
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT 60,
  `passing_score` int DEFAULT 70,
  `total_questions` int DEFAULT 0,
  `created_by` int DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_quiz_course` (`course_id`),
  KEY `fk_quiz_creator` (`created_by`),
  CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quizzes` (`course_id`, `title`, `description`, `duration`, `passing_score`, `total_questions`, `created_by`, `is_published`, `created_at`) VALUES
(1, 'Quiz Bab 1: Bilangan Bulat', 'Kuis untuk menguji pemahaman tentang bilangan bulat', 30, 70, 10, 2, 1, '2025-12-08 14:48:36'),
(1, 'Quiz Bab 2: Pecahan', 'Kuis untuk menguji pemahaman tentang pecahan', 30, 70, 10, 2, 1, '2025-12-08 14:48:36'),
(2, 'Quiz Tata Bahasa', 'Kuis untuk menguji pemahaman tata bahasa Indonesia', 30, 70, 15, 3, 1, '2025-12-08 14:48:36'),
(3, 'Quiz Struktur Atom', 'Kuis tentang struktur atom dan unsur', 45, 75, 12, 2, 1, '2025-12-08 14:48:36'),
(4, 'Quiz Present Tense', 'Kuis untuk menguji pemahaman Present Tense', 25, 70, 8, 2, 1, '2025-12-08 14:48:36');

-- =====================================================
-- Table: questions
-- =====================================================
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` enum('multiple_choice','essay','true_false') DEFAULT 'multiple_choice',
  `points` int DEFAULT 10,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_question_quiz` (`quiz_id`),
  CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `questions` (`quiz_id`, `question_text`, `question_type`, `points`) VALUES
(1, 'Berapakah hasil dari -5 + 3?', 'multiple_choice', 10),
(1, 'Berapakah hasil dari -10 - (-5)?', 'multiple_choice', 10),
(1, 'Berapakah hasil dari -3 × -4?', 'multiple_choice', 10),
(2, 'Berapakah hasil dari 1/2 + 1/4?', 'multiple_choice', 10),
(2, 'Berapakah hasil dari 3/4 - 1/8?', 'multiple_choice', 10),
(3, 'Apa itu frasa nominatif? Jelaskan dengan contoh', 'essay', 10),
(4, 'Elektron memiliki muatan negatif. (Benar/Salah)', 'true_false', 10),
(5, 'Lengkapi: I ___ playing football now. (am/is/are)', 'multiple_choice', 10);

-- =====================================================
-- Table: quiz_results
-- =====================================================
DROP TABLE IF EXISTS `quiz_results`;
CREATE TABLE `quiz_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `student_id` int NOT NULL,
  `score` decimal(5,2) DEFAULT 0,
  `percentage` decimal(5,2) DEFAULT 0,
  `attempts` int DEFAULT 1,
  `last_attempt_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_result_quiz` (`quiz_id`),
  KEY `fk_result_student` (`student_id`),
  KEY `idx_quiz_student` (`quiz_id`, `student_id`),
  CONSTRAINT `fk_result_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_result_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_results` (`quiz_id`, `student_id`, `score`, `percentage`, `attempts`, `status`, `completed_at`) VALUES
(1, 4, 85, 85.00, 1, 'completed', '2025-12-08 14:48:36'),
(1, 5, 75, 75.00, 1, 'completed', '2025-12-08 14:48:36'),
(1, 6, 90, 90.00, 2, 'completed', '2025-12-08 14:48:36'),
(2, 4, 70, 70.00, 1, 'completed', '2025-12-08 14:48:36'),
(2, 5, 80, 80.00, 1, 'completed', '2025-12-08 14:48:36'),
(3, 5, 85, 85.00, 1, 'completed', '2025-12-08 14:48:36'),
(3, 7, 65, 65.00, 1, 'completed', '2025-12-08 14:48:36'),
(4, 6, 88, 88.00, 1, 'completed', '2025-12-08 14:48:36'),
(5, 5, 92, 92.00, 1, 'completed', '2025-12-08 14:48:36'),
(5, 7, 78, 78.00, 1, 'completed', '2025-12-08 14:48:36');

-- =====================================================
-- Table: answer_options (for multiple choice questions)
-- =====================================================
DROP TABLE IF EXISTS `answer_options`;
CREATE TABLE `answer_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_option_question` (`question_id`),
  CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `answer_options` (`question_id`, `option_text`, `is_correct`) VALUES
(1, '-2', 1),
(1, '-8', 0),
(1, '2', 0),
(1, '8', 0),
(2, '-5', 1),
(2, '-15', 0),
(2, '5', 0),
(2, '15', 0),
(3, '-12', 0),
(3, '12', 1),
(3, '-7', 0),
(3, '7', 0),
(4, '3/4', 1),
(4, '1/6', 0),
(4, '5/8', 0),
(4, '2/3', 0),
(5, '5/8', 1),
(5, '1/4', 0),
(5, '7/16', 0),
(5, '3/8', 0),
(8, 'am', 1),
(8, 'is', 0),
(8, 'are', 0),
(8, 'was', 0);

-- =====================================================
-- Table: grade_sync (untuk integrasi partner)
-- =====================================================
DROP TABLE IF EXISTS `grade_sync`;
CREATE TABLE `grade_sync` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `grade` decimal(5,2) NOT NULL,
  `synced_from` varchar(50) DEFAULT 'integration_api',
  `sync_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course` (`student_id`, `course_id`),
  KEY `fk_sync_student` (`student_id`),
  KEY `fk_sync_course` (`course_id`),
  CONSTRAINT `fk_sync_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sync_course` FOREIGN KEY (`course_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grade_sync` (`student_id`, `course_id`, `grade`, `sync_date`) VALUES
(4, 1, 85.50, '2025-12-08 14:48:36'),
(4, 2, 78.00, '2025-12-08 14:48:36'),
(5, 1, 92.00, '2025-12-08 14:48:36'),
(5, 4, 88.50, '2025-12-08 14:48:36'),
(6, 1, 76.50, '2025-12-08 14:48:36'),
(7, 2, 80.00, '2025-12-08 14:48:36');

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
