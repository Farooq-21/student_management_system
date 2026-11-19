const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } = require('../controllers/enrollmentController');

router.get('/', authenticateToken, requireAdmin, getAllEnrollments);
router.post('/', authenticateToken, requireAdmin, createEnrollment);
router.put('/:id', authenticateToken, requireAdmin, updateEnrollment);
router.delete('/:id', authenticateToken, requireAdmin, deleteEnrollment);

module.exports = router;
