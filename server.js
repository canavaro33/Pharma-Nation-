const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE)
    }
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware to pass user to views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const obatRoutes = require('./routes/obatRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const donasiRoutes = require('./routes/donasiRoutes');
const setupController = require('./controllers/setupController');

// Use Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/obat', obatRoutes);
app.use('/transaksi', transaksiRoutes);
app.use('/laporan', laporanRoutes);
app.use('/donations', donasiRoutes);

// Setup Route (HAPUS SETELAH SETUP SELESAI!)
app.get('/setup', setupController.setupDatabase);

// Root Route
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// app.get('/login'...) is handled by authRoutes now, so we remove the placeholder


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
