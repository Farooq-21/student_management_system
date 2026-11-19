const { AppDataSource } = require('../config/database');

// POST /api/students  — student submits their own registration
const createStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentRepo = AppDataSource.getRepository('Student');

    // Prevent duplicate registration
    const existing = await studentRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted a registration' });
    }

    // Check roll number uniqueness
    const { rollNumber, fullName, email, phone, address, gender, dateOfBirth,
      program, semester, emergencyContact, bloodGroup, departmentId } = req.body;

    if (!rollNumber || !fullName || !email) {
      return res.status(400).json({ success: false, message: 'Roll number, full name, and email are required' });
    }

    const rollExists = await studentRepo.findOne({ where: { rollNumber } });
    if (rollExists) {
      return res.status(409).json({ success: false, message: 'Roll number already exists' });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const studentData = {
      rollNumber,
      fullName,
      email,
      phone: phone || null,
      address: address || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      profilePicture,
      program: program || null,
      semester: semester ? parseInt(semester) : null,
      emergencyContact: emergencyContact || null,
      bloodGroup: bloodGroup || null,
      user: { id: userId },
    };

    if (departmentId) {
      studentData.department = { departmentId: parseInt(departmentId) };
    }

    const student = studentRepo.create(studentData);
    await studentRepo.save(student);

    // Return with relations
    const saved = await studentRepo.findOne({
      where: { studentId: student.studentId },
      relations: ['department', 'user'],
    });

    res.status(201).json({ success: true, message: 'Registration submitted successfully', student: sanitizeStudent(saved) });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// GET /api/students/me  — student gets their own record
const getMyStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentRepo = AppDataSource.getRepository('Student');
    const student = await studentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['department', 'user', 'enrollments', 'enrollments.course'],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'No registration found', registered: false });
    }

    res.json({ success: true, registered: true, student: sanitizeStudent(student) });
  } catch (err) {
    console.error('Get my student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/students  — admin gets all students
const getAllStudents = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository('Student');
    const { search, departmentId, semester, page = 1, limit = 10 } = req.query;

    const qb = studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.department', 'department')
      .leftJoinAndSelect('student.user', 'user');

    if (search) {
      qb.andWhere(
        '(student.fullName ILIKE :search OR student.rollNumber ILIKE :search OR student.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    if (departmentId) {
      qb.andWhere('department.departmentId = :departmentId', { departmentId: parseInt(departmentId) });
    }
    if (semester) {
      qb.andWhere('student.semester = :semester', { semester: parseInt(semester) });
    }

    const total = await qb.getCount();
    const students = await qb
      .skip((parseInt(page) - 1) * parseInt(limit))
      .take(parseInt(limit))
      .orderBy('student.registrationDate', 'DESC')
      .getMany();

    res.json({
      success: true,
      students: students.map(sanitizeStudent),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get all students error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/students/:id  — admin or the student themselves
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentRepo = AppDataSource.getRepository('Student');
    const student = await studentRepo.findOne({
      where: { studentId: parseInt(id) },
      relations: ['department', 'user', 'enrollments', 'enrollments.course', 'enrollments.course.department'],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only access their own record
    if (req.user.role === 'STUDENT' && student.user.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, student: sanitizeStudent(student) });
  } catch (err) {
    console.error('Get student by id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentRepo = AppDataSource.getRepository('Student');
    const student = await studentRepo.findOne({
      where: { studentId: parseInt(id) },
      relations: ['user'],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only update their own record
    if (req.user.role === 'STUDENT' && student.user.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { rollNumber, fullName, email, phone, address, gender, dateOfBirth,
      program, semester, emergencyContact, bloodGroup, departmentId } = req.body;

    // Check if roll number is taken by another student
    if (rollNumber && rollNumber !== student.rollNumber) {
      const rollExists = await studentRepo.findOne({ where: { rollNumber } });
      if (rollExists && rollExists.studentId !== student.studentId) {
        return res.status(409).json({ success: false, message: 'Roll number already in use' });
      }
    }

    if (rollNumber) student.rollNumber = rollNumber;
    if (fullName) student.fullName = fullName;
    if (email) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (gender !== undefined) student.gender = gender;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (program !== undefined) student.program = program;
    if (semester !== undefined) student.semester = semester ? parseInt(semester) : null;
    if (emergencyContact !== undefined) student.emergencyContact = emergencyContact;
    if (bloodGroup !== undefined) student.bloodGroup = bloodGroup;
    if (req.file) student.profilePicture = `/uploads/${req.file.filename}`;
    if (departmentId !== undefined) {
      student.department = departmentId ? { departmentId: parseInt(departmentId) } : null;
    }

    await studentRepo.save(student);

    const updated = await studentRepo.findOne({
      where: { studentId: student.studentId },
      relations: ['department', 'user'],
    });

    res.json({ success: true, message: 'Student updated successfully', student: sanitizeStudent(updated) });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/students/:id  — admin only
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentRepo = AppDataSource.getRepository('Student');
    const enrollmentRepo = AppDataSource.getRepository('Enrollment');

    const student = await studentRepo.findOne({ where: { studentId: parseInt(id) } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete related enrollments first
    await enrollmentRepo.delete({ student: { studentId: parseInt(id) } });
    await studentRepo.remove(student);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/students/:id/courses
const getStudentCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollmentRepo = AppDataSource.getRepository('Enrollment');

    const enrollments = await enrollmentRepo.find({
      where: { student: { studentId: parseInt(id) } },
      relations: ['course', 'course.department'],
    });

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error('Get student courses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/students/stats  — admin dashboard stats
const getStats = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository('Student');
    const deptRepo = AppDataSource.getRepository('Department');
    const courseRepo = AppDataSource.getRepository('Course');
    const enrollRepo = AppDataSource.getRepository('Enrollment');

    const [totalStudents, totalDepartments, totalCourses, totalEnrollments] = await Promise.all([
      studentRepo.count(),
      deptRepo.count(),
      courseRepo.count(),
      enrollRepo.count(),
    ]);

    res.json({ success: true, stats: { totalStudents, totalDepartments, totalCourses, totalEnrollments } });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: strip password from user relation
const sanitizeStudent = (s) => {
  if (!s) return null;
  const obj = { ...s };
  if (obj.user) {
    const { password, ...safeUser } = obj.user;
    obj.user = safeUser;
  }
  return obj;
};

module.exports = { createStudent, getMyStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, getStudentCourses, getStats };
