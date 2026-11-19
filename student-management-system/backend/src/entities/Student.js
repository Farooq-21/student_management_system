require('reflect-metadata');
const { EntitySchema } = require('typeorm');

const Student = new EntitySchema({
  name: 'Student',
  tableName: 'students',
  columns: {
    studentId: {
      type: 'int',
      primary: true,
      generated: true,
    },
    rollNumber: {
      type: 'varchar',
      length: 50,
      unique: true,
      nullable: false,
    },
    fullName: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    gender: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    dateOfBirth: {
      type: 'date',
      nullable: true,
    },
    profilePicture: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    program: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    semester: {
      type: 'int',
      nullable: true,
    },
    emergencyContact: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    bloodGroup: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    registrationDate: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    department: {
      type: 'many-to-one',
      target: 'Department',
      joinColumn: { name: 'departmentId' },
      inverseSide: 'students',
      nullable: true,
      // No eager — load explicitly with relations[]
    },
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      inverseSide: 'student',
      nullable: false,
    },
    enrollments: {
      type: 'one-to-many',
      target: 'Enrollment',
      inverseSide: 'student',
    },
  },
});

module.exports = { Student };
