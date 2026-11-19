require('reflect-metadata');
const { EntitySchema } = require('typeorm');

const Course = new EntitySchema({
  name: 'Course',
  tableName: 'courses',
  columns: {
    courseId: {
      type: 'int',
      primary: true,
      generated: true,
    },
    courseName: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    creditHours: {
      type: 'int',
      nullable: false,
      default: 3,
    },
  },
  relations: {
    department: {
      type: 'many-to-one',
      target: 'Department',
      joinColumn: { name: 'departmentId' },
      inverseSide: 'courses',
      nullable: true,
      // No eager — load explicitly
    },
    enrollments: {
      type: 'one-to-many',
      target: 'Enrollment',
      inverseSide: 'course',
    },
  },
});

module.exports = { Course };
