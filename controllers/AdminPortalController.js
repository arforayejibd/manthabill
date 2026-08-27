import prisma from '../services/prisma.js';

// 1. Clients List
export async function listUsers(req, res) {
  try {
    const clients = await prisma.tbuser.findMany({
      include: {
        tbdetailuser: true
      },
      orderBy: { id_user: 'desc' }
    });
    res.render('admin/users', {
      activeMenu: 'clients',
      clients
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 2. Domain Accounts List
export async function listDomains(req, res) {
  try {
    const domains = await prisma.domains.findMany({
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        },
        tlds: true
      },
      orderBy: { id: 'desc' }
    });
    res.render('admin/domains', {
      activeMenu: 'domains',
      domains
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 3. TLD Pricing List
export async function listTLDs(req, res) {
  try {
    const tlds = await prisma.tlds.findMany({
      orderBy: { id: 'desc' }
    });
    res.render('admin/tlds', {
      activeMenu: 'tlds',
      tlds
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 4. Shared Hostings List
export async function listHostings(req, res) {
  try {
    const hostings = await prisma.hostings.findMany({
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        },
        products: true
      },
      orderBy: { id: 'desc' }
    });
    res.render('admin/hostings', {
      activeMenu: 'shared_hostings',
      hostings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 5. Invoices List
export async function listInvoices(req, res) {
  try {
    const invoices = await prisma.invoices.findMany({
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.render('admin/invoices', {
      activeMenu: 'invoices',
      invoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 6. Tickets Inbox List
export async function listTickets(req, res) {
  try {
    const tickets = await prisma.inboxes.findMany({
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.render('admin/tickets', {
      activeMenu: 'tickets',
      tickets
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 7. Hosting Packages List
export async function listPackages(req, res) {
  try {
    const packages = await prisma.products.findMany({
      orderBy: { id: 'desc' }
    });
    res.render('admin/packages', {
      activeMenu: 'packages',
      packages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 8. General Settings Form
export async function generalSettings(req, res) {
  try {
    const settings = await prisma.tbsetting.findUnique({
      where: { id_setting: 1 }
    });
    res.render('admin/setting_umum', {
      activeMenu: 'settings_general',
      settings,
      successMsg: req.session.successMsg || null
    });
    req.session.successMsg = null;
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 9. Update General Settings Action
export async function updateGeneralSettings(req, res) {
  const { nama_hosting, judul_hosting, alamat_hosting, email_hosting, telp_hosting, tos, tax, limit_email, prefix, nama_bank, no_rekening, nama_pemilik } = req.body;
  try {
    await prisma.tbsetting.update({
      where: { id_setting: 1 },
      data: {
        nama_hosting,
        judul_hosting,
        alamat_hosting,
        email_hosting,
        telp_hosting,
        tos,
        tax: Number(tax) || 0,
        limit_email: Number(limit_email) || 10,
        prefix: Number(prefix) || 1000,
        nama_bank,
        no_rekening,
        nama_pemilik
      }
    });
    req.session.successMsg = 'General settings updated successfully!';
    res.redirect('/staff/Admin/setting_umum');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 10. API Settings Form
export async function apiSettings(req, res) {
  try {
    const settings = await prisma.tbsetting.findUnique({
      where: { id_setting: 1 }
    });
    res.render('admin/setting_api', {
      activeMenu: 'settings_api',
      settings,
      successMsg: req.session.successMsg || null
    });
    req.session.successMsg = null;
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// 11. Update API Settings Action
export async function updateApiSettings(req, res) {
  const { api_key } = req.body;
  try {
    await prisma.tbsetting.update({
      where: { id_setting: 1 },
      data: {
        api_key
      }
    });
    req.session.successMsg = 'API settings updated successfully!';
    res.redirect('/staff/Admin/setting_api');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
