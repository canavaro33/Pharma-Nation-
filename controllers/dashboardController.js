const db = require('../config/database');
const Obat = require('../models/obatModel');

exports.getDashboard = async (req, res) => {
    try {
        // Stats: Total Obat (Types), Obat Expiring (<30 days), Active Donations (Pending)

        // 1. Total Obat Types
        const [totalObatResult] = await db.execute('SELECT COUNT(*) as count FROM obat');
        const totalObat = totalObatResult[0].count;

        // 2. Expiring in 30 days
        const [expiringResult] = await db.execute(`
            SELECT COUNT(*) as count FROM batch_obat 
            WHERE status = 'available' 
            AND tgl_exp <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) 
            AND tgl_exp >= CURRENT_DATE
        `);
        const expiringCount = expiringResult[0].count;

        // 3. Active Donations (Pending)
        const [donationResult] = await db.execute("SELECT COUNT(*) as count FROM donasi_obat WHERE status = 'pending'");
        const donationCount = donationResult[0].count;

        // Recent Stock Summary (Top 5 lowest stock)
        const [lowStock] = await db.execute('SELECT * FROM obat ORDER BY stok_total ASC LIMIT 5');

        res.render('dashboard/index', {
            user: req.session.user,
            pageTitle: 'Dashboard',
            totalObat,
            expiringCount,
            donationCount,
            lowStock
        });
    } catch (error) {
        console.error(error);
        res.render('dashboard/index', {
            user: req.session.user,
            pageTitle: 'Dashboard',
            totalObat: 0,
            expiringCount: 0,
            donationCount: 0,
            lowStock: []
        });
    }
};
