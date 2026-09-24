import { Pool } from '@neondatabase/serverless';

let globalPool: Pool | null = null;

export function getDbPool(): Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';
    globalPool = new Pool({ connectionString });
  }
  return globalPool;
}

export const sql: any = (...args: any[]) => {
  throw new Error('Direct sql template execution not configured in driver pool');
};

