import dataSource from '../src/database/data-source';
import { seedDatabase } from '../src/database/seeds/seed';

export async function prepareTestDatabase(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.runMigrations();
  await seedDatabase(dataSource);
}

export async function closeTestDatabase(): Promise<void> {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
