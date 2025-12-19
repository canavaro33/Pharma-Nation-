const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.getLoginPage = (req, res) => {
    res.render('auth/login', { error: null });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);

        if (!user) {
            return res.render('auth/login', { error: 'Username tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('auth/login', { error: 'Password salah' });
        }

        // Set session
        req.session.user = {
            id: user.id_user,
            username: user.username,
            nama: user.nama,
            role: user.role
        };

        return res.redirect('/dashboard');

    } catch (error) {
        console.error(error);
        return res.render('auth/login', { error: 'Terjadi kesalahan sistem' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
};
