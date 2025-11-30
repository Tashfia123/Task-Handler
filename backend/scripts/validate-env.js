const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('Checking .env configuration...\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.log('\nPlease add DATABASE_URL to your .env file:');
  console.log('DATABASE_URL=postgresql://username:password@host:port/database');
  process.exit(1);
}

console.log('✓ DATABASE_URL is set');

// Parse the connection string to validate format
try {
  // Remove query parameters for parsing
  const urlWithoutParams = databaseUrl.split('?')[0];
  
  // Check if it starts with postgresql://
  if (!urlWithoutParams.startsWith('postgresql://')) {
    console.error('❌ ERROR: DATABASE_URL must start with "postgresql://"');
    console.log('\nCurrent value:', databaseUrl.substring(0, 50) + '...');
    process.exit(1);
  }

  // Extract parts
  const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = urlWithoutParams.match(urlPattern);

  if (!match) {
    console.error('❌ ERROR: DATABASE_URL format is incorrect');
    console.log('\nExpected format:');
    console.log('postgresql://username:password@host:port/database');
    console.log('\nCurrent value:', databaseUrl.substring(0, 80) + '...');
    console.log('\nCommon issues:');
    console.log('- Missing username or password');
    console.log('- Missing @ symbol');
    console.log('- Missing port number');
    console.log('- Missing database name');
    process.exit(1);
  }

  const [, username, password, host, port, database] = match;

  console.log('✓ Connection string format is valid');
  console.log('\nConnection details:');
  console.log('  Username:', username);
  console.log('  Password:', password ? '***' + password.slice(-3) : 'NOT SET');
  console.log('  Host:', host);
  console.log('  Port:', port);
  console.log('  Database:', database);

  // Check for common issues
  if (host === 'base' || host === 'localhost' && !databaseUrl.includes('neon')) {
    console.log('\n⚠ WARNING: Host is "' + host + '"');
    if (host === 'base') {
      console.log('  This looks like an incomplete connection string.');
      console.log('  Make sure you copied the FULL connection string from Neon.');
    }
  }

  if (username === 'username' || password === 'password') {
    console.log('\n⚠ WARNING: Using placeholder credentials');
    console.log('  Make sure you replaced username/password with actual values');
  }

  if (databaseUrl.includes('neon') || databaseUrl.includes('neon.tech')) {
    console.log('\n✓ Detected Neon PostgreSQL connection');
    if (!databaseUrl.includes('sslmode=require')) {
      console.log('⚠ WARNING: SSL mode not specified. Adding sslmode=require is recommended for Neon.');
    }
  }

  console.log('\n✅ .env file looks good!');
  console.log('\nYou can now run: npm run init-db');

} catch (error) {
  console.error('❌ Error parsing DATABASE_URL:', error.message);
  console.log('\nPlease check your .env file and ensure DATABASE_URL is correctly formatted.');
  process.exit(1);
}

