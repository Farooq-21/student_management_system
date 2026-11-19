const { AppDataSource } = require('../config/database');

// GET /api/enrollments
const getAllEnrollments = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Enrollment');
    const { studentId, courseId } = req.query;

    const qb = repo.createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.department', 'department')
      .orderBy('enrollment.enrollmentDate', 'DESC');

    if (studentId) qb.andWhere('student.studentId = :studentId', { studentId: parseInt(studentId) });
    if (courseId) qb.andWhere('course.courseId = :courseId', { courseId: parseInt(courseId) });

    const enrollments = await qb.getMany();
    res.json({ success: true, enrollments });
  } catch (err) {
    console.error('Get enrollments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/enrollments
const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }

    const repo = AppDataSource.getRepository('Enrollment');

    // Prevent duplicate enrollment
    const existing = await repo.findOne({
      where: {
        student: { studentId: parseInt(studentId) },
        course: { courseId: parseInt(courseId) },
      },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Student is already enrolled in this course' });
    }

    // Verify student and course exist
    const studentRepo = AppDataSource.getRepository('Student');
    const courseRepo = AppDataSource.getRepository('Course');

    const student = await studentRepo.findOne({ where: { studentId: parseInt(studentId) } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const course = await courseRepo.findOne({ where: { courseId: parseInt(courseId) } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollment = repo.create({
      student: { studentId: parseInt(studentId) },
      course: { courseId: parseInt(courseId) },
    });
    await repo.save(enrollment);

    const saved = await repo.findOne({
      where: { enrollmentId: enrollment.enrollmentId },
      relations: ['student', 'course', 'course.department'],
    });

    res.status(201).json({ success: true, message: 'Enrollment created successfully', enrollment: saved });
  } catch (err) {
    console.error('Create enrollment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/enrollments/:id  — update grade
const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade } = req.body;
    const repo = AppDataSource.getRepository('Enrollment');

    const enrollment = await repo.findOne({
      where: { enrollmentId: parseInt(id) },
      relations: ['student', 'course'],
    });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    enrollment.grade = grade || null;
    await repo.save(enrollment);

    res.json({ success: true, message: 'Grade updated successfully', enrollment });
  } catch (err) {
    console.error('Update enrollment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/enrollments/:id
const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository('Enrollment');

    const enrollment = await repo.findOne({ where: { enrollmentId: parseInt(id) } });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    await repo.remove(enrollment);
    res.json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (err) {
    console.error('Delete enrollment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment };
