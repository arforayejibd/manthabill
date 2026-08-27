import prisma from '../services/prisma.js';
import { encrypt, decrypt } from '../utils/crypt.js';
import { filterDomain } from '../utils/domain.js';

function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function index(req, res) {
  try {
    const personal = await prisma.products.findMany({
      where: { type_product: 1 } // TYPE_PERSONAL
    });

    const professional = await prisma.products.findMany({
      where: { type_product: 2 } // TYPE_PROFESSIONAL
    });

    res.render('product/index', {
      activeMenu: 'products',
      personal,
      professional,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function beli(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.status(404).send('Product Not Found');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  try {
    const product = await prisma.products.findUnique({
      where: { id }
    });

    if (!product) {
      return res.redirect('/Product');
    }

    // Check for pending invoices
    const pendingCount = await prisma.invoices.count({
      where: {
        user_id: userId,
        status_inv: { in: [2, 3] } // PENDING or CONFIRMED
      }
    });

    if (pendingCount > 0) {
      req.session.pesan = '<div class="alert alert-danger" role="alert">Please settle your unpaid invoices first!</div>';
      return res.redirect('/Invoice');
    }

    const tldList = await prisma.tlds.findMany({
      where: { status_tld: 1 }
    });

    const diskonUnik = generateRandomInt(100, 999);

    res.render('product/show', {
      activeMenu: 'products',
      product,
      tldList,
      diskonUnik,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function invoiceStore(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.status(404).send('Product Not Found');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  const { domain, tld_name, pilihan, diskon_unik } = req.body;
  const errors = [];

  if (!domain || !tld_name) {
    errors.push('Domain name is required!');
  }
  const choice = parseInt(pilihan, 10);
  if (isNaN(choice) || choice < 1) {
    errors.push('Invalid billing duration selected!');
  }
  const discount = parseInt(diskon_unik, 10);
  if (isNaN(discount) || discount < 100 || discount > 999) {
    errors.push('Invalid discount configuration!');
  }

  try {
    const product = await prisma.products.findUnique({
      where: { id }
    });

    if (!product) {
      return res.redirect('/Product');
    }

    if (errors.length > 0) {
      const tldList = await prisma.tlds.findMany({
        where: { status_tld: 1 }
      });
      req.session.errors = errors;
      return res.render('product/show', {
        activeMenu: 'products',
        product,
        tldList,
        diskonUnik: discount,
        oldDomain: domain,
        oldTldName: tld_name,
        oldPilihan: choice,
        encrypt
      });
    }

    const domainJadi = filterDomain(domain, tld_name);
    const namaProduct = `${product.nama_product} ${domainJadi}`;

    const detailProduk = product.type_product > 1
      ? `${namaProduct}  -  ${choice} years`
      : `${namaProduct}  -  ${choice} months`;

    const months = product.type_product > 1 ? choice * 12 : choice;
    const price = parseFloat(product.harga) * choice;
    const total = price - discount;

    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const due = new Date();
    due.setDate(due.getDate() + 3);

    // Random 5 char code for invoice number
    const noInvoice = Math.random().toString(36).substring(2, 7).toLowerCase();

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const hosting = await tx.hostings.create({
        data: {
          id_product: product.id,
          user_id: userId,
          nama_hosting: namaProduct,
          user_cpanel: '',
          harga: price,
          start_hosting: today,
          end_hosting: endDate,
          domain: domainJadi,
          status_hosting: 2 // STATUS_PENDING
        }
      });

      return tx.invoices.create({
        data: {
          user_id: userId,
          id_hosting: hosting.id,
          no_invoice: noInvoice,
          detail_produk: detailProduk,
          due: due,
          inv_date: today,
          sub_total: price,
          diskon_inv: discount,
          pajak_inv: 0,
          total_jumlah: total,
          status_inv: 2, // STATUS_PENDING
          token_inv: ''
        }
      });
    });

    res.redirect(`/Invoice/bayar/${encrypt(createdInvoice.id)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
