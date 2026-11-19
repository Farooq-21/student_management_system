const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAllCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

router.get('/', authenticateToken, getAllCourses);
router.post('/', authenticateToken, requireAdmin, createCourse);
router.put('/:id', authenticateToken, requireAdmin, updateCourse);
router.delete('/:id', authenticateToken, requireAdmin, deleteCourse);

module.exports = router;
