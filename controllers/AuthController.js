import bcrypt from 'bcryptjs';
import prisma from '../services/prisma.js';

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length).toLowerCase();
}

export async function loginIndex(req, res) {
  const word = generateRandomString(5);
  req.session.captchaword = word;

  res.render('auth/login', {
    captchaWord: word,
    oldEmail: ''
  });
}

export async function loginStore(req, res) {
  const { email, password, captcha } = req.body;
  const errors = [];

  // Captcha validation
  if (!captcha || captcha.toLowerCase() !== req.session.captchaword) {
    errors.push('The captcha you entered is incorrect!');
  }

  if (errors.length > 0) {
    req.session.errors = errors;
    return res.redirect('/login');
  }

  try {
    const user = await prisma.tbuser.findFirst({
      where: { email }
    });

    if (!user) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Email not registered!</div>';
      return res.redirect('/login');
    }

    if (user.status === 3) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Your account is suspended, please contact administrator!</div>';
      return res.redirect('/login');
    }

    if (user.status === 2) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Your account is not verified yet, please check your email!</div>';
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.pesan2 = '<div class="alert alert-danger" role="alert">Invalid username or password!</div>';
      return res.redirect('/login');
    }

    // Set user session
    req.session.user = {
      id_user: user.id_user,
      client: user.client,
      email: user.email
    };

    res.redirect('/Member');
  } catch (err) {
    console.error(err);
    req.session.pesan2 = '<div class="alert alert-danger" role="alert">An error occurred during login.</div>';
    res.redirect('/login');
  }
}

export async function registerIndex(req, res) {
  const word = generateRandomString(6);
  req.session.captchaword = word;

  res.render('auth/register', {
    captchaWord: word,
    oldEmail: ''
  });
}

export async function registerStore(req, res) {
  const { email, password, password2, captcha, tos } = req.body;
  const errors = [];

  // Captcha validation
  if (!captcha || captcha.toLowerCase() !== req.session.captchaword) {
    errors.push('The captcha you entered is incorrect!');
  }

  // Password matching
  if (password !== password2) {
    errors.push('Passwords do not match!');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long!');
  }

  if (!tos) {
    errors.push('You must agree to the Terms of Service!');
  }

  if (errors.length > 0) {
    req.session.errors = errors;
    return res.render('auth/register', {
      captchaWord: req.session.captchaword,
      oldEmail: email
    });
  }

  try {
    // Check if email already exists
    const emailExists = await prisma.tbuser.findFirst({
      where: { email }
    });

    if (emailExists) {
      req.session.errors = ['Email already registered!'];
      return res.render('auth/register', {
        captchaWord: req.session.captchaword,
        oldEmail: email
      });
    }

    // Calculate next client number
    const maxClient = await prisma.tbuser.aggregate({
      _max: { client: true }
    });

    const prefixVal = await prisma.tbsetting.findUnique({
      where: { id_setting: 1 }
    });
    const prefix = prefixVal?.prefix || 1;
    const nextClientNum = (maxClient._max.client || 0) === 0 ? prefix : maxClient._max.client + 1;

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = generateRandomString(20);

    // Create user and details via transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.tbuser.create({
        data: {
          client: nextClientNum,
          email,
          password: hashedPassword,
          date_create: new Date(),
          status: 1, // Auto active for local dev simulation, normally STATUS_UNVERIFIED = 2
          validasi_token: token
        }
      });

      await tx.tbdetailuser.create({
        data: {
          id_user: newUser.id_user,
          gambar: 'default.jpg'
        }
      });
    });

    req.session.pesan2 = '<div class="alert alert-success" role="alert">Your account was successfully registered! Please login.</div>';
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.session.pesan = 'Registration failed due to a database error.';
    res.redirect('/register');
  }
}

export async function checkEmail(req, res) {
  const { email } = req.body;
  try {
    const user = await prisma.tbuser.findFirst({
      where: { email }
    });
    res.send(user ? 'ok' : '');
  } catch (err) {
    res.status(500).send('');
  }
}

export async function getCsrf(req, res) {
  res.json({
    csrf_name: '_token',
    csrf_token: 'dummy-csrf-token'
  });
}

export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
}
