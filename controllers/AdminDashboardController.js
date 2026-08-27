import prisma from '../services/prisma.js';

export async function index(req, res) {
  try {
    const totalUsers = await prisma.tbuser.count();
    const jmlService = await prisma.hostings.count({
      where: { status_hosting: 1 } // ACTIVE
    });
    const jmlInvoice = await prisma.invoices.count();
    const jmlInbox = await prisma.inboxes.count({
      where: { status_inbox: { lt: 3 } } // PENDING (not Closed)
    });

    const berita = await prisma.news.findFirst({
      orderBy: { tgl_berita: 'desc' }
    });

    const dataTicket = await prisma.inboxes.findMany({
      where: { status_inbox: { lt: 3 } },
      orderBy: { time: 'desc' },
      take: 5,
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        }
      }
    });

    res.render('admin/dashboard', {
      activeMenu: 'dashboard',
      totalUsers,
      jmlService,
      jmlInvoice,
      jmlInbox,
      berita,
      dataTicket
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export function logout(req, res) {
  req.session.admin = null;
  req.session.destroy(() => {
    res.redirect('/staff/login');
  });
}

export function checkpoint(req, res) {
  res.status(200).send('OK');
}

export function help(req, res) {
  res.render('admin/help', {
    activeMenu: 'help'
  });
}
