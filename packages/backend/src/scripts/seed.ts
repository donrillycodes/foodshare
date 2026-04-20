import db from '../config/database';
import admin from '../config/firebase';
import logger from '../utils/logger';

/**
 * FoodShare SUPER_ADMIN Seed Script
 *
 * This script creates the SUPER_ADMIN account directly in the database.
 * It is never exposed via any API endpoint.
 *
 * Usage:
 *   npx ts-node src/scripts/seed.ts <firebase-uid> <email> <firstName> <lastName>
 *
 * Example:
 *   npx ts-node src/scripts/seed.ts abc123uid admin@foodshare.ca Emmanuel Oyenuga
 *
 * Run this ONCE after initial deployment.
 * Running it again with the same Firebase UID will throw a duplicate error.
 */

const seedSuperAdmin = async () => {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    logger.error(
      'Usage: npx ts-node src/scripts/seed.ts <firebaseUid> <email> <firstName> <lastName>'
    );
    process.exit(1);
  }

  const [firebaseUid, email, firstName, lastName] = args;

  logger.info(`Starting SUPER_ADMIN seed for: ${email}`);

  // Step 1 — Verify the Firebase UID exists
  // This confirms the account was created in Firebase before running the seed
  try {
    const firebaseUser = await admin.auth().getUser(firebaseUid);
    logger.info(`Firebase user verified: ${firebaseUser.email}`);
  } catch (error) {
    logger.error(
      'Firebase UID not found. Please create the account in Firebase first.',
      { firebaseUid }
    );
    process.exit(1);
  }

  // Step 2 — Check if a SUPER_ADMIN already exists
  const existingSuperAdmin = await db.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (existingSuperAdmin) {
    logger.error(
      'A SUPER_ADMIN account already exists. Only one SUPER_ADMIN is allowed.',
      { existingEmail: existingSuperAdmin.email }
    );
    process.exit(1);
  }

  // Step 3 — Check if the email is already taken
  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    logger.error('An account with this email already exists in the database.', {
      email,
    });
    process.exit(1);
  }

  // Step 4 — Create the SUPER_ADMIN user record
  const superAdmin = await db.user.create({
    data: {
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      firebaseUid,
      role: 'SUPER_ADMIN',
      isActive: true,
      // All permission flags enabled
      canApproveNgos: true,
      canManageUsers: true,
      canManageContent: true,
      canViewAnalytics: true,
      canManageAdmins: true,
      canManageDonations: true,
    },
  });

  logger.info(`SUPER_ADMIN user created: ${superAdmin.id}`);

  // Step 5 — Create the AdminMember record
  const adminMember = await db.adminMember.create({
    data: {
      userId: superAdmin.id,
      department: 'OPERATIONS',
      status: 'ACTIVE',
      invitedById: superAdmin.id,
      joinedAt: new Date(),
      canApproveNgos: true,
      canManageUsers: true,
      canManageContent: true,
      canViewAnalytics: true,
      canManageAdmins: true,
      canManageDonations: true,
    },
  });

  logger.info(`AdminMember record created: ${adminMember.id}`);

  // Step 6 — Write confirmation
  logger.info(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ SUPER_ADMIN seeded successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ID         : ${superAdmin.id}
  Email      : ${superAdmin.email}
  Name       : ${superAdmin.firstName} ${superAdmin.lastName}
  Role       : ${superAdmin.role}
  Firebase   : ${firebaseUid}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Keep these details safe.
  This script cannot be run again.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  await db.$disconnect();
  process.exit(0);
};

seedSuperAdmin().catch((error) => {
  logger.error('Seed script failed', { error });
  db.$disconnect();
  process.exit(1);
});
