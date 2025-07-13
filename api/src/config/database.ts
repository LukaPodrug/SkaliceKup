import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// Parse Neon PostgreSQL connection string
const parseConnectionString = (connectionString: string) => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: {
      rejectUnauthorized: false
    }
  };
};

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return parseConnectionString(process.env.DATABASE_URL);
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skalice',
    ssl: isProd ? { rejectUnauthorized: false } : false
  };
};

const dbConfig = getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  synchronize: !isProd,
  logging: !isProd,
  entities: [isProd ? 'dist/entities/**/*.js' : 'src/entities/**/*.ts'],
  migrations: [isProd ? 'dist/migrations/**/*.js' : 'src/migrations/**/*.ts'],
  subscribers: [isProd ? 'dist/subscribers/**/*.js' : 'src/subscribers/**/*.ts'],
});

const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to PostgreSQL...');

    await AppDataSource.initialize();
    console.log('✅ PostgreSQL Connected successfully!');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    console.log('💡 Make sure PostgreSQL is running. You can start it with:');
    console.log('   - brew services start postgresql (if installed via Homebrew)');
    console.log('   - sudo systemctl start postgresql (Linux)');
    console.log('   - Or use a cloud PostgreSQL service like AWS RDS or Heroku Postgres');
    process.exit(1);
  }
};

export default connectDB;