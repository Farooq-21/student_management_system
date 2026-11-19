require('dotenv').config();
const { DataSource } = require('typeorm');
const { User } = require('../entities/User');
const { Student } = require('../entities/Student');
const { Department } = require('../entities/Department');
const { Course } = require('../entities/Course');
const { Enrollment } = require('../entities/Enrollment');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'university_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: false,
  entities: [User, Student, Department, Course, Enrollment],
});

module.exports = { AppDataSource };
