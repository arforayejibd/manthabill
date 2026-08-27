export function authGuard(req, res, next) {
  if (!req.session.user) {
    req.session.pesan = '<div class="alert alert-danger" role="alert">Please login to access this page!</div>';
    return res.redirect('/login');
  }
  next();
}

export function guestGuard(req, res, next) {
  if (req.session.user) {
    return res.redirect('/Member');
  }
  if (req.session.admin) {
    return res.redirect('/staff/Admin');
  }
  next();
}

export function adminGuard(req, res, next) {
  if (!req.session.admin) {
    req.session.pesan = '<div class="alert alert-danger" role="alert">Please login as admin!</div>';
    return res.redirect('/staff/login');
  }
  next();
}

export function adminGuestGuard(req, res, next) {
  if (req.session.admin) {
    return res.redirect('/staff/Admin');
  }
  next();
}
