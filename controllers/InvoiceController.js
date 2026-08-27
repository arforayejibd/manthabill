import prisma from '../services/prisma.js';
import { encrypt, decrypt } from '../utils/crypt.js';

export async function index(req, res) {
  const userId = req.session.user.id_user;
  try {
    const invoices = await prisma.invoices.findMany({
      where: { user_id: userId },
      orderBy: { id: 'desc' }
    });

    res.render('invoice/index', {
      activeMenu: 'invoices',
      invoices,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function detail(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.redirect('/Invoice');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  try {
    const invoice = await prisma.invoices.findFirst({
      where: { id, user_id: userId },
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).send('Invoice Not Found');
    }

    res.render('invoice/show', {
      activeMenu: 'invoices',
      invoice,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function bayar(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.redirect('/Invoice');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  try {
    const invoice = await prisma.invoices.findFirst({
      where: {
        id,
        user_id: userId,
        status_inv: { in: [2, 3] } // PENDING or CONFIRMED
      },
      include: {
        tbuser: {
          include: {
            tbdetailuser: true
          }
        }
      }
    });

    if (!invoice) {
      return res.redirect('/Invoice');
    }

    res.render('invoice/show', {
      activeMenu: 'invoices',
      invoice,
      bayarMode: true,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function konfirmasi(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.redirect('/Invoice');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  try {
    const invoice = await prisma.invoices.findFirst({
      where: {
        id,
        user_id: userId,
        status_inv: { in: [2, 3] }
      }
    });

    if (!invoice) {
      return res.redirect('/Invoice');
    }

    res.render('invoice/confirm', {
      activeMenu: 'invoices',
      invoice,
      encrypted: encryptedId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function storeKonfirmasi(req, res) {
  const { encryptedId } = req.params;
  const idStr = decrypt(encryptedId);

  if (!idStr) {
    return res.redirect('/Invoice');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;
  const { namaPengirim, namaBank, nomorInvoice, tanggal, jmlTransfer } = req.body;

  try {
    const invoice = await prisma.invoices.findFirst({
      where: {
        id,
        user_id: userId,
        status_inv: { in: [2, 3] }
      }
    });

    if (!invoice) {
      return res.redirect('/Invoice');
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment_confirmations.create({
        data: {
          invoice_id: invoice.id,
          user_id: userId,
          nama_pengirim: namaPengirim,
          bank_pengirim: namaBank,
          no_invoice: nomorInvoice.toLowerCase(),
          tanggal_konfirmasi: new Date(tanggal),
          total_bayar: parseFloat(jmlTransfer),
          status: 2 // STATUS_PENDING / PENDING REVIEW
        }
      });

      await tx.invoices.update({
        where: { id: invoice.id },
        data: { status_inv: 3 } // STATUS_CONFIRMED
      });
    });

    req.session.pesan = '<div class="alert alert-success" role="alert">Your payment confirmation has been submitted, please wait 1x24 hours for review!</div>';
    res.redirect('/Invoice');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
