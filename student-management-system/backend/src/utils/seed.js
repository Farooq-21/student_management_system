require('dotenv').config();
require('reflect-metadata');
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('../config/database');

async function seed() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected to database.');

    const userRepo = AppDataSource.getRepository('User');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const existing = await userRepo.findOne({ where: { email: adminEmail } });
    if (existing) {
      console.log(`Admin account already exists: ${adminEmail}`);
      await AppDataSource.destroy();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = userRepo.create({
      fullName: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    });

    await userRepo.save(admin);
    console.log(`Admin account created successfully!`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`\nIMPORTANT: Change the admin password in .env before deploying to production.`);

    // Seed some default departments
    const deptRepo = AppDataSource.getRepository('Department');
    const deptCount = await deptRepo.count();
    if (deptCount === 0) {
      const departments = [
        { departmentName: 'Computer Science', location: 'Block A' },
        { departmentName: 'Software Engineering', location: 'Block B' },
        { departmentName: 'Electrical Engineering', location: 'Block C' },
        { departmentName: 'Business Administration', location: 'Block D' },
        { departmentName: 'Mathematics', location: 'Block E' },
      ];
      for (const dept of departments) {
        await deptRepo.save(deptRepo.create(dept));
      }
      console.log('Default departments seeded.');
    }

    await AppDataSource.destroy();
    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
