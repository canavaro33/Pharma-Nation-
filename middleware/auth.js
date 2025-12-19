function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/login');
}

function isGuest(req, res, next) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    return next();
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Admin') {
        return next();
    }
    return res.status(403).send('Akses Ditolak: Hanya Admin yang dapat mengakses halaman ini.');
}

module.exports = { isAuthenticated, isGuest, isAdmin };
