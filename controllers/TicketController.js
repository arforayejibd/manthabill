import prisma from '../services/prisma.js';

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length).toLowerCase();
}

export async function index(req, res) {
  const userId = req.session.user.id_user;

  try {
    const tickets = await prisma.inboxes.findMany({
      where: { user_id: userId },
      orderBy: { time: 'desc' }
    });

    res.render('ticket/index', {
      activeMenu: 'tickets',
      tickets
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export function create(req, res) {
  const word = generateRandomString(5);
  req.session.captchaword = word;

  res.render('ticket/create', {
    activeMenu: 'tickets',
    captchaWord: word
  });
}

export async function store(req, res) {
  const userId = req.session.user.id_user;
  const { judulPesan, isiPesan, captcha } = req.body;
  const errors = [];

  if (captcha !== req.session.captchaword) {
    errors.push('Incorrect captcha code! Please try again.');
  }

  if (!judulPesan || judulPesan.trim().length > 80) {
    errors.push('Subject must be filled and less than 80 characters!');
  }

  if (!isiPesan || isiPesan.trim().length < 10 || isiPesan.trim().length > 400) {
    errors.push('Message content must be between 10 and 400 characters!');
  }

  if (errors.length > 0) {
    req.session.errors = errors;
    const word = generateRandomString(5);
    req.session.captchaword = word;
    return res.render('ticket/create', {
      activeMenu: 'tickets',
      captchaWord: word,
      oldJudulPesan: judulPesan,
      oldIsiPesan: isiPesan
    });
  }

  const key = generateRandomString(20);

  try {
    await prisma.inboxes.create({
      data: {
        user_id: userId,
        is_adm: 1, // Inbox AUTHOR_USER
        judul: judulPesan,
        pesan: isiPesan,
        key_token: key,
        time: Math.floor(Date.now() / 1000),
        status_inbox: 1 // STATUS_REPLIED / SUBMITTED BY USER
      }
    });

    req.session.pesan = '<div class="alert alert-success" role="alert">Ticket created successfully! Our staff will get back to you shortly.</div>';
    res.redirect('/Ticket');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function show(req, res) {
  const { key } = req.params;
  const userId = req.session.user.id_user;

  try {
    const ticket = await prisma.inboxes.findFirst({
      where: {
        key_token: key,
        user_id: userId
      }
    });

    if (!ticket) {
      return res.redirect('/Ticket');
    }

    const replies = await prisma.inbox_replies.findMany({
      where: { key_token: key },
      orderBy: { time: 'asc' }
    });

    res.render('ticket/show', {
      activeMenu: 'tickets',
      ticket,
      replies
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function reply(req, res) {
  const { key } = req.params;
  const userId = req.session.user.id_user;
  const { isiPesan } = req.body;
  const errors = [];

  if (!isiPesan || isiPesan.trim().length < 10 || isiPesan.trim().length > 400) {
    errors.push('Reply message must be between 10 and 400 characters!');
  }

  try {
    const ticket = await prisma.inboxes.findFirst({
      where: {
        key_token: key,
        user_id: userId
      }
    });

    if (!ticket) {
      return res.redirect('/Ticket');
    }

    if (ticket.status_inbox !== 2) { // STATUS_OPEN (Answered by Admin and waiting for user reply)
      req.session.pesan2 = '<div class="alert alert-warning" role="alert">You can only reply to tickets answered by admin!</div>';
      return res.redirect(`/Ticket/lihat_ticket/${key}`);
    }

    if (errors.length > 0) {
      req.session.errors = errors;
      const replies = await prisma.inbox_replies.findMany({
        where: { key_token: key },
        orderBy: { time: 'asc' }
      });
      return res.render('ticket/show', {
        activeMenu: 'tickets',
        ticket,
        replies
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.inbox_replies.create({
        data: {
          is_admin: 2, // AUTHOR_USER in replies table
          key_token: key,
          pesan: isiPesan,
          time: Math.floor(Date.now() / 1000)
        }
      });

      await tx.inboxes.update({
        where: { id: ticket.id },
        data: { status_inbox: 1 } // Set status to 1 (replied by user)
      });
    });

    req.session.pesan2 = '<div class="alert alert-success" role="alert">Reply submitted successfully! Please wait for staff response.</div>';
    res.redirect(`/Ticket/lihat_ticket/${key}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

export async function close(req, res) {
  const { key } = req.params;
  const userId = req.session.user.id_user;

  try {
    const ticket = await prisma.inboxes.findFirst({
      where: {
        key_token: key,
        user_id: userId
      }
    });

    if (!ticket) {
      return res.redirect('/Ticket');
    }

    await prisma.inboxes.update({
      where: { id: ticket.id },
      data: { status_inbox: 3 } // STATUS_CLOSED
    });

    req.session.pesan = '<div class="alert alert-success" role="alert">Support ticket has been successfully locked and closed!</div>';
    res.redirect('/Ticket');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
