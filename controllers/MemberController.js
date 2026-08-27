import prisma from '../services/prisma.js';

export async function index(req, res) {
  const userId = req.session.user.id_user;

  try {
    // 1. Stats
    const hostingsCount = await prisma.hostings.count({
      where: { user_id: userId }
    });

    const domainsCount = await prisma.domains.count({
      where: { user_id: userId }
    });

    const invoicesCount = await prisma.invoices.count({
      where: {
        user_id: userId,
        status_inv: { in: [2, 3] } // Pending + Confirmed
      }
    });

    const ticketsCount = await prisma.inboxes.count({
      where: {
        user_id: userId,
        status_inbox: { lt: 3 } // Active (not Closed)
      }
    });

    // 2. Recent Invoices
    const recentInvoices = await prisma.invoices.findMany({
      where: { user_id: userId },
      orderBy: { id: 'desc' },
      take: 5
    });

    // 3. Active Services
    const activeHostings = await prisma.hostings.findMany({
      where: {
        user_id: userId,
        status_hosting: 1
      }
    });

    // 4. Latest News
    const news = await prisma.news.findMany({
      orderBy: { tgl_berita: 'desc' },
      take: 1
    });

    // 5. Recent Tickets
    const recentTickets = await prisma.inboxes.findMany({
      where: { user_id: userId },
      orderBy: { id: 'desc' },
      take: 5
    });

    res.render('member/index', {
      activeMenu: 'dashboard',
      hostingsCount,
      domainsCount,
      invoicesCount,
      ticketsCount,
      recentInvoices,
      activeHostings,
      news,
      recentTickets
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
