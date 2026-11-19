const { AppDataSource } = require('../config/database');

// GET /api/departments
const getAllDepartments = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Department');
    const departments = await repo.find({ order: { departmentName: 'ASC' } });

    // Add student count
    const withCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await AppDataSource.getRepository('Student').count({
          where: { department: { departmentId: dept.departmentId } },
        });
        return { ...dept, studentCount: count };
      })
    );

    res.json({ success: true, departments: withCounts });
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { departmentName, location } = req.body;
    if (!departmentName) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const repo = AppDataSource.getRepository('Department');
    const existing = await repo.findOne({ where: { departmentName } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Department with this name already exists' });
    }

    const dept = repo.create({ departmentName: departmentName.trim(), location: location?.trim() || null });
    await repo.save(dept);

    res.status(201).json({ success: true, message: 'Department created successfully', department: dept });
  } catch (err) {
    console.error('Create department error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName, location } = req.body;
    const repo = AppDataSource.getRepository('Department');

    const dept = await repo.findOne({ where: { departmentId: parseInt(id) } });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    if (departmentName) dept.departmentName = departmentName.trim();
    if (location !== undefined) dept.location = location?.trim() || null;

    await repo.save(dept);
    res.json({ success: true, message: 'Department updated successfully', department: dept });
  } catch (err) {
    console.error('Update department error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository('Department');

    const dept = await repo.findOne({ where: { departmentId: parseInt(id) } });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    // Check for dependent students
    const studentCount = await AppDataSource.getRepository('Student').count({
      where: { department: { departmentId: parseInt(id) } },
    });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${studentCount} student(s) are assigned to this department`,
      });
    }

    await repo.remove(dept);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Delete department error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };
