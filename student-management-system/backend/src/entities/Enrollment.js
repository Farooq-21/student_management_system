require('reflect-metadata');
const { EntitySchema } = require('typeorm');

const Enrollment = new EntitySchema({
  name: 'Enrollment',
  tableName: 'enrollments',
  columns: {
    enrollmentId: {
      type: 'int',
      primary: true,
      generated: true,
    },
    enrollmentDate: {
      type: 'timestamp',
      createDate: true,
    },
    grade: {
      type: 'varchar',
      length: 5,
      nullable: true,
    },
  },
  relations: {
    student: {
      type: 'many-to-one',
      target: 'Student',
      joinColumn: { name: 'studentId' },
      inverseSide: 'enrollments',
      nullable: false,
      // No eager — load explicitly
    },
    course: {
      type: 'many-to-one',
      target: 'Course',
      joinColumn: { name: 'courseId' },
      inverseSide: 'enrollments',
      nullable: false,
      // No eager — load explicitly
    },
  },
});

module.exports = { Enrollment };
