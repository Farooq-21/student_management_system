require('dotenv').config();
require('reflect-metadata');
const { AppDataSource } = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`   Frontend: http://localhost:${PORT}`);
      console.log(`   API:      http://localhost:${PORT}/api`);
      console.log(`   Health:   http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('\nPlease check your .env file and ensure PostgreSQL is running.');
    console.error('Required settings: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME');
    process.exit(1);
  });
