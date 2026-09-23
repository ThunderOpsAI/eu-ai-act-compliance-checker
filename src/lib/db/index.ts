import { Pool } from '@neondatabase/serverless';

let globalPool: Pool | null = null;

export function getDbPool(): Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';
    globalPool = new Pool({ connectionString });
  }
  return globalPool;
}
