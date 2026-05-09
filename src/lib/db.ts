import { getDatabaseUrl } from './secret';

const url = await getDatabaseUrl();

// pass `url` into your db client instead of process.env.DATABASE_URL
