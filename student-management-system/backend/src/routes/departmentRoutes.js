const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');

// Anyone authenticated can read departments (for registration form dropdowns)
router.get('/', authenticateToken, getAllDepartments);

// Admin only for mutations
router.post('/', authenticateToken, requireAdmin, createDepartment);
router.put('/:id', authenticateToken, requireAdmin, updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, deleteDepartment);

module.exports = router;
