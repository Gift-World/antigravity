// scripts/findRegion.mjs
import pg from 'pg';
const { Client } = pg;

const PROJECT_REF = 'pzxedvijuvpwertsjqcv';
const USERNAME = `postgres.${PROJECT_REF}`;

const regions = [
  'aws-0-us-east-1',
  'aws-0-us-east-2',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-eu-central-1',
  'aws-0-eu-north-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-0-ap-south-1',
  'aws-0-ap-northeast-1',
  'aws-0-ap-northeast-2',
  'aws-0-sa-east-1',
  'aws-0-af-south-1',
  'aws-0-me-central-1',
];

async function checkRegion(region) {
  const host = `${region}.pooler.supabase.com`;
  const client = new Client({
    host,
    port: 6543,
    user: USERNAME,
    password: 'probe_password_check',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000,
  });

  try {
    await client.connect();
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      console.log(`\n🎉 FOUND EXACT REGION! Host: ${host}`);
      return host;
    }
  } finally {
    try { await client.end(); } catch (e) {}
  }
  return null;
}

async function run() {
  console.log('Probing Supabase regions for project:', PROJECT_REF);
  for (const r of regions) {
    process.stdout.write(`Testing ${r}... `);
    const match = await checkRegion(r);
    if (match) {
      console.log('Project pooler is:', match);
      break;
    } else {
      process.stdout.write('not here\n');
    }
  }
}

run();
