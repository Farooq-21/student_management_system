const { AppDataSource } = require('../config/database');

// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Course');
    const { departmentId } = req.query;

    const qb = repo.createQueryBuilder('course')
      .leftJoinAndSelect('course.department', 'department')
      .orderBy('course.courseName', 'ASC');

    if (departmentId) {
      qb.where('department.departmentId = :departmentId', { departmentId: parseInt(departmentId) });
    }

    const courses = await qb.getMany();
    res.json({ success: true, courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/courses
const createCourse = async (req, res) => {
  try {
    const { courseName, creditHours, departmentId } = req.body;
    if (!courseName) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }

    const repo = AppDataSource.getRepository('Course');
    const courseData = {
      courseName: courseName.trim(),
      creditHours: creditHours ? parseInt(creditHours) : 3,
    };

    if (departmentId) {
      courseData.department = { departmentId: parseInt(departmentId) };
    }

    const course = repo.create(courseData);
    await repo.save(course);

    const saved = await repo.findOne({
      where: { courseId: course.courseId },
      relations: ['department'],
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course: saved });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, creditHours, departmentId } = req.body;
    const repo = AppDataSource.getRepository('Course');

    const course = await repo.findOne({ where: { courseId: parseInt(id) }, relations: ['department'] });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (courseName) course.courseName = courseName.trim();
    if (creditHours !== undefined) course.creditHours = parseInt(creditHours);
    if (departmentId !== undefined) {
      course.department = departmentId ? { departmentId: parseInt(departmentId) } : null;
    }

    await repo.save(course);

    const updated = await repo.findOne({ where: { courseId: course.courseId }, relations: ['department'] });
    res.json({ success: true, message: 'Course updated successfully', course: updated });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository('Course');
    const enrollRepo = AppDataSource.getRepository('Enrollment');

    const course = await repo.findOne({ where: { courseId: parseInt(id) } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollCount = await enrollRepo.count({ where: { course: { courseId: parseInt(id) } } });
    if (enrollCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${enrollCount} enrollment(s) exist for this course`,
      });
    }

    await repo.remove(course);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllCourses, createCourse, updateCourse, deleteCourse };
