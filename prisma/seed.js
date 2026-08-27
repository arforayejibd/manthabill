import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.tbadmin.upsert({
    where: { id_admin: 1 },
    update: {},
    create: {
      id_admin: 1,
      username: 'admin',
      password: adminPassword,
      level: 1,
      status: 1,
    },
  });

  // 2. Setting
  await prisma.tbsetting.upsert({
    where: { id_setting: 1 },
    update: {},
    create: {
      id_setting: 1,
      nama_hosting: 'ManthaBill',
      judul_hosting: 'ManthaBill - Billing System',
      alamat_hosting: '',
      email_hosting: '',
      telp_hosting: '',
      tos: '',
      tax: 0,
      limit_email: 50,
      prefix: 1,
      api_key: '',
      nama_bank: '',
      no_rekening: '',
      nama_pemilik: '',
    },
  });

  // 3. TLDs
  await prisma.tlds.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tld: 'com',
      harga_tld: 150000.00,
      status_tld: 1,
      default: 1,
    },
  });

  await prisma.tlds.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      tld: 'net',
      harga_tld: 170000.00,
      status_tld: 1,
      default: 0,
    },
  });

  // 4. Module
  await prisma.modules.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nama_modul: 'smtp2go',
      api_key: '',
      status: 0,
    },
  });

  // 5. User
  const userPassword = await bcrypt.hash('password', 12);
  const existingUser = await prisma.tbuser.findFirst({
    where: { email: 'user@gmail.com' },
  });

  if (!existingUser) {
    const user = await prisma.tbuser.create({
      data: {
        client: 1,
        email: 'user@gmail.com',
        password: userPassword,
        date_create: new Date(),
        status: 1, // ACTIVE
      },
    });

    await prisma.tbdetailuser.create({
      data: {
        id_user: user.id_user,
        gambar: 'default.jpg',
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
