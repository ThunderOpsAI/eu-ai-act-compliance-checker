import { Pool } from '@neondatabase/serverless';

let globalPool: Pool | null = null;

export function getDbPool(): Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined.');
    }
    globalPool = new Pool({ connectionString });
  }
  return globalPool;
}
