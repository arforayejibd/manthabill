import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import prisma from './services/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Views and templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'manthabill-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    secure: false, // Set to true if running HTTPS
  }
}));

// Local variable sharing with views
app.use(async (req, res, next) => {
  // Share session information
  res.locals.session = req.session;
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;

  // Fetch user detail if logged in
  if (req.session.user) {
    try {
      res.locals.userDetail = await prisma.tbdetailuser.findFirst({
        where: { id_user: req.session.user.id_user }
      });
    } catch (err) {
      res.locals.userDetail = null;
    }
  } else {
    res.locals.userDetail = null;
  }


  // Retrieve general settings
  try {
    const setting = await prisma.tbsetting.findUnique({ where: { id_setting: 1 } });
    res.locals.setting = setting || {
      nama_hosting: 'ManthaBill',
      judul_hosting: 'ManthaBill - Billing System'
    };
  } catch (err) {
    res.locals.setting = {
      nama_hosting: 'ManthaBill',
      judul_hosting: 'ManthaBill - Billing System'
    };
  }

  // Flash message compatibility helpers
  res.locals.pesan = req.session.pesan || null;
  res.locals.pesan2 = req.session.pesan2 || null;
  res.locals.errors = req.session.errors || null;
  
  // Clear flash values
  delete req.session.pesan;
  delete req.session.pesan2;
  delete req.session.errors;

  next();
});

// Basic routing
app.get('/', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/staff/Admin');
  }
  if (req.session.user) {
    return res.redirect('/Member');
  }
  res.redirect('/login');
});

// Import and use routes
import webRouter from './routes/web.js';
import memberRouter from './routes/member.js';
import productRouter from './routes/product.js';
import invoiceRouter from './routes/invoice.js';
import domainRouter from './routes/domain.js';
import serviceRouter from './routes/service.js';
import ticketRouter from './routes/ticket.js';
import settingRouter from './routes/setting.js';
import adminRouter from './routes/admin.js';

app.use('/', webRouter);
app.use('/Member', memberRouter);
app.use('/Product', productRouter);
app.use('/Invoice', invoiceRouter);
app.use('/Domain', domainRouter);
app.use('/Service', serviceRouter);
app.use('/Ticket', ticketRouter);
app.use('/Setting', settingRouter);
app.use('/staff/Admin', adminRouter);










app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
