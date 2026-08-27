import prisma from '../services/prisma.js';
import { encrypt, decrypt } from '../utils/crypt.js';

export async function index(req, res) {
  const userId = req.session.user.id_user;

  try {
    const hostings = await prisma.hostings.findMany({
      where: { user_id: userId },
      include: {
        products: true
      }
    });

    res.render('service/index', {
      activeMenu: 'services',
      hostings,
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
    return res.redirect('/Service');
  }

  const id = parseInt(idStr, 10);
  const userId = req.session.user.id_user;

  try {
    const hosting = await prisma.hostings.findFirst({
      where: { id, user_id: userId },
      include: {
        products: true
      }
    });

    if (!hosting) {
      return res.redirect('/Service');
    }

    res.render('service/show', {
      activeMenu: 'services',
      hosting,
      encrypt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
