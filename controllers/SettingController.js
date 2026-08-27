import prisma from '../services/prisma.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function index(req, res) {
  const userId = req.session.user.id_user;

  try {
    const user = await prisma.tbuser.findUnique({
      where: { id_user: userId }
    });

    res.render('setting/index', {
      activeMenu: 'settings',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function update(req, res) {
  const userId = req.session.user.id_user;
  const { namaDepan, namaBelakang, namaUsaha, notelp, alamat1, alamat2, kota, provinsi, kodepos, negara } = req.body;
  const errors = [];

  if (!namaDepan || !alamat1 || !kota || !provinsi || !negara) {
    errors.push('Required profile fields are missing!');
  }

  try {
    const user = await prisma.tbuser.findUnique({
      where: { id_user: userId }
    });

    if (errors.length > 0) {
      req.session.errors = errors;
      return res.render('setting/index', {
        activeMenu: 'settings',
        user,
        oldNamaDepan: namaDepan,
        oldNamaBelakang: namaBelakang,
        oldNamaUsaha: namaUsaha,
        oldNotelp: notelp,
        oldAlamat1: alamat1,
        oldAlamat2: alamat2,
        oldKota: kota,
        oldProvinsi: provinsi,
        oldKodepos: kodepos,
        oldNegara: negara
      });
    }

    const detail = await prisma.tbdetailuser.findFirst({
      where: { id_user: userId }
    });

    let filename = detail ? detail.gambar : 'default.jpg';

    if (req.file) {
      filename = `avatars/${req.file.filename}`;
      // Clean up old avatar if exists
      if (detail && detail.gambar && detail.gambar !== 'default.jpg' && detail.gambar.startsWith('avatars/')) {
        const oldPath = path.join('public/uploads', detail.gambar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updateData = {
      nama_depan: namaDepan,
      nama_belakang: namaBelakang || '',
      nama_usaha: namaUsaha || '',
      phone: notelp || '',
      alamat: alamat1,
      alamat2: alamat2 || '',
      kota: kota,
      provinsi: provinsi,
      kodepos: kodepos || '',
      negara: negara,
      gambar: filename,
      time_req: Math.floor(Date.now() / 1000) + 300
    };

    if (detail) {
      await prisma.tbdetailuser.update({
        where: { id_detail: detail.id_detail },
        data: updateData
      });
    } else {
      await prisma.tbdetailuser.create({
        data: {
          id_user: userId,
          ...updateData
        }
      });
    }

    req.session.pesan2 = '<div class="alert alert-success" role="alert">Your profile settings have been updated!</div>';
    res.redirect('/Setting');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export function changePassword(req, res) {
  res.render('setting/password', {
    activeMenu: 'settings'
  });
}

export async function updatePassword(req, res) {
  const userId = req.session.user.id_user;
  const { passwordLama, passwordBaru, passwordBaru2 } = req.body;
  const errors = [];

  if (!passwordLama || !passwordBaru || !passwordBaru2) {
    errors.push('All password fields are required!');
  }

  if (passwordBaru !== passwordBaru2) {
    errors.push('New password and confirmation do not match!');
  }

  try {
    const user = await prisma.tbuser.findUnique({
      where: { id_user: userId }
    });

    const isMatch = await bcrypt.compare(passwordLama, user.password);
    if (!isMatch) {
      errors.push('Current password is incorrect!');
    }

    if (errors.length > 0) {
      req.session.errors = errors;
      return res.render('setting/password', {
        activeMenu: 'settings'
      });
    }

    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    await prisma.tbuser.update({
      where: { id_user: userId },
      data: { password: hashedPassword }
    });

    req.session.pesan = '<div class="alert alert-success" role="alert">Your account password has been updated!</div>';
    res.redirect('/Setting/password');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
