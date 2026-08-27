import bcrypt from 'bcryptjs';
import prisma from '../services/prisma.js';

export function loginIndex(req, res) {
  res.render('admin/auth/login', {
    oldUsername: ''
  });
}

export async function loginStore(req, res) {
  const { username, password } = req.body;
  const errors = [];

  if (!username) errors.push('Username cannot be empty!');
  if (!password) errors.push('Password cannot be empty!');

  if (errors.length > 0) {
    req.session.errors = errors;
    return res.render('admin/auth/login', { oldUsername: username });
  }

  try {
    const admin = await prisma.tbadmin.findFirst({
      where: { username }
    });

    if (!admin) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Invalid username or password!</div>';
      return res.render('admin/auth/login', { oldUsername: username });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Invalid username or password!</div>';
      return res.render('admin/auth/login', { oldUsername: username });
    }

    // Set admin session
    req.session.admin = {
      id_admin: admin.id_admin,
      username: admin.username,
      level: admin.level
    };

    res.redirect('/staff/Admin');
  } catch (err) {
    console.error(err);
    req.session.pesan2 = '<div class="alert alert-danger" role="alert">An error occurred during login.</div>';
    res.redirect('/staff/login');
  }
}

export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/staff/login');
  });
}
