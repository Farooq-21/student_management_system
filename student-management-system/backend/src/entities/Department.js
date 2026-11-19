require('reflect-metadata');
const { EntitySchema } = require('typeorm');

const Department = new EntitySchema({
  name: 'Department',
  tableName: 'departments',
  columns: {
    departmentId: {
      type: 'int',
      primary: true,
      generated: true,
    },
    departmentName: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    location: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
  },
  relations: {
    students: {
      type: 'one-to-many',
      target: 'Student',
      inverseSide: 'department',
    },
    courses: {
      type: 'one-to-many',
      target: 'Course',
      inverseSide: 'department',
    },
  },
});

module.exports = { Department };
