const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createStudent, getMyStudent, getAllStudents, getStudentById,
  updateStudent, deleteStudent, getStudentCourses, getStats
} = require('../controllers/studentController');

// Stats — admin only
router.get('/stats', authenticateToken, requireAdmin, getStats);

// Student gets their own registration
router.get('/me', authenticateToken, getMyStudent);

// Student submits registration
router.post('/', authenticateToken, upload.single('profilePicture'), createStudent);

// Admin gets all students
router.get('/', authenticateToken, requireAdmin, getAllStudents);

// Get student by ID (admin or own student)
router.get('/:id', authenticateToken, getStudentById);

// Get student's enrolled courses
router.get('/:id/courses', authenticateToken, getStudentCourses);

// Update student (admin or own student)
router.put('/:id', authenticateToken, upload.single('profilePicture'), updateStudent);

// Delete student — admin only
router.delete('/:id', authenticateToken, requireAdmin, deleteStudent);

module.exports = router;
