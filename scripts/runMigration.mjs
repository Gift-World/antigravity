// scripts/runMigration.mjs
import fs from 'fs';
import path from 'path';

const PROJECT_REF = 'pzxedvijuvpwertsjqcv';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6eGVkdmlqdXZwd2VydHNqcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk0MjM1MiwiZXhwIjoyMTAzNTE4MzUyfQ.Kb5ippYSrQQ8-_cm4_5i7XdjATfzHvNnywzQ1rA1ztY';

const migrationPath = path.resolve('./supabase/migrations/20260828000000_init_antigravity.sql');
const seedPath = path.resolve('./supabase/seed.sql');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

async function testManagementApi(sql) {
  const endpoints = [
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/query`,
    `https://api.supabase.io/v1/projects/${PROJECT_REF}/database/query`,
  ];

  for (const ep of endpoints) {
    try {
      console.log(`Trying management API: ${ep}`);
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: sql }),
      });

      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response:`, text.substring(0, 300));
      if (res.ok) return { success: true, text };
    } catch (err) {
      console.warn(`Error on ${ep}:`, err.message);
    }
  }
  return { success: false };
}

async function run() {
  console.log('--- Testing Management API ---');
  await testManagementApi('SELECT 1;');
}

run();
