import prisma from '../services/prisma.js';
import { filterDomain } from '../utils/domain.js';

export async function index(req, res) {
  const userId = req.session.user.id_user;

  try {
    const tldList = await prisma.tlds.findMany({
      where: { status_tld: 1 }
    });

    const domains = await prisma.domains.findMany({
      where: { user_id: userId }
    });

    res.render('domain/index', {
      activeMenu: 'domains',
      tldList,
      domains
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function beli(req, res) {
  try {
    const tldList = await prisma.tlds.findMany({
      where: { status_tld: 1 }
    });

    res.render('domain/buy', {
      activeMenu: 'domains',
      tldList
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function storeBeli(req, res) {
  const userId = req.session.user.id_user;
  const { domain, tld_id } = req.body;
  const errors = [];

  const tldId = parseInt(tld_id, 10);
  if (!domain || isNaN(tldId)) {
    errors.push('Domain and Extension fields are required!');
  }

  try {
    const tld = await prisma.tlds.findUnique({
      where: { id: tldId }
    });

    if (!tld) {
      errors.push('Invalid extension selected!');
    }

    if (errors.length > 0) {
      const tldList = await prisma.tlds.findMany({
        where: { status_tld: 1 }
      });
      req.session.errors = errors;
      return res.render('domain/buy', {
        activeMenu: 'domains',
        tldList,
        oldDomain: domain,
        oldTldId: tldId
      });
    }

    const domainName = filterDomain(domain, tld.tld);

    await prisma.domain_transits.create({
      data: {
        user_id: userId,
        id_tld: tldId,
        nama_domain: domainName
      }
    });

    req.session.pesan = '<div class="alert alert-success" role="alert">Domain order submitted successfully! Please complete the invoice payment if generated.</div>';
    res.redirect('/Domain');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
