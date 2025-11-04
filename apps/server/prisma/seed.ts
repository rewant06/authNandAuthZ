// prisma/seed.ts

import { PrismaClient, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- 1. Create Permissions ---
  // A "super-admin" permission
  const permManageAll = await prisma.permission.upsert({
    where: {
      action_subject: { action: PermissionAction.MANAGE, subject: 'all' },
    },
    update: {},
    create: { action: PermissionAction.MANAGE, subject: 'all' },
  });

  const permUpdateSelf = await prisma.permission.upsert({
    where: {
      action_subject: { action: PermissionAction.UPDATE, subject: 'UserSelf' },
    },
    update: {},
    create: { action: PermissionAction.UPDATE, subject: 'UserSelf' },
  });
  console.log('Created permissions.');

  // A "read all users" permission
  const permReadUsers = await prisma.permission.upsert({
    where: {
      action_subject: { action: PermissionAction.READ, subject: 'User' },
    },
    update: {},
    create: { action: PermissionAction.READ, subject: 'User' },
  });

  // A "read own profile" permission
  const permReadSelf = await prisma.permission.upsert({
    where: {
      action_subject: { action: PermissionAction.READ, subject: 'UserSelf' },
    },
    update: {},
    create: { action: PermissionAction.READ, subject: 'UserSelf' },
  });

  console.log('Created permissions.');

  // --- 2. Create Roles and Assign Permissions ---
  // ADMIN Role
  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Site administrator with all permissions',
      permissions: {
        connect: { id: permManageAll.id }, // Connect to MANAGE:all
      },
    },
  });

  // USER Role
  const roleUser = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user with basic permissions',
      permissions: {
        connect: [{ id: permReadSelf.id }, { id: permUpdateSelf.id }], // Connect to READ:UserSelf
      },
    },
  });

  console.log('Created roles and assigned permissions.');

  // --- Optional: Create a Test Admin User ---
  // You can uncomment this to create a test admin
  // Make sure to set a secure password
  // const adminEmail = 'admin@example.com';
  // const adminPassword = 'super-strong-admin-password-123';
  // const argon2 = require('argon2');

  // const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  // if (!existingAdmin) {
  //   const hash = await argon2.hash(adminPassword);
  //   const admin = await prisma.user.create({
  //     data: {
  //       email: adminEmail,
  //       name: 'Admin User',
  //       hashedPassword: hash,
  //       roles: {
  //         connect: { id: roleAdmin.id }, // Assign ADMIN role
  //       },
  //     },
  //   });
  //   console.log(`Created admin user: ${admin.email}`);
  // }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
