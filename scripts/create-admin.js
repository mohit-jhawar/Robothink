// One-time script to create (or update the password of) the admin user
// that logs into /admin/login.html. Run with: npm run seed:admin
// Reads ADMIN_EMAIL / ADMIN_PASSWORD / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD === 'change-this-before-running-the-script') {
    console.error('Set ADMIN_EMAIL and a real ADMIN_PASSWORD in .env before running this script.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Could not list existing users:', listError.message);
    process.exit(1);
  }

  const found = existing.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  let userId;

  if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, { password: ADMIN_PASSWORD });
    if (error) {
      console.error('Could not update admin password:', error.message);
      process.exit(1);
    }
    userId = found.id;
    console.log(`Updated password for existing admin user: ${ADMIN_EMAIL}`);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error || !created?.user) {
      console.error('Could not create admin user:', error ? error.message : 'unknown error');
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  }

  // Ensure the user has an admin profile in the profiles table
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: ADMIN_EMAIL.toLowerCase(),
    role: 'admin',
    full_name: 'System Administrator'
  });

  if (profileError) {
    console.error('Could not create or update admin profile in database:', profileError.message);
    process.exit(1);
  }

  console.log('Admin profile successfully verified in profiles database table.');
  console.log('You can now log in at /admin/login.html with this email & password.');
}

main();
