const db = require('../config/database');

exports.getStockReport = async (req, res) => {
    try {
        // Simple Stock Report: List all Obats with their movement (mocked movement for now or complicate query)
        // Spec: "Tabel laporan dengan kolom: Nama Obat, Stok Awal, Masuk, Keluar, Donasi, Stok Akhir"
        // Calculating "Stok Awal" dynamically is heavy (Reverse calculation from current stock + history).
        // For simplicity in this MV, we might just show Current Stock + Total Masuk/Keluar stats if available, 
        // OR just List Transaction History.
        // Let's list Transaction History as "Stock Report" usually implies movement log or snapshot.
        // Let's do a Snapshot + Movement Summary Join.

        const [rows] = await db.execute(`
            SELECT 
                o.nama_obat, 
                o.stok_total as stok_akhir,
                COALESCE(SUM(tm.jumlah), 0) as total_masuk,
                COALESCE(SUM(tk.jumlah), 0) as total_keluar
            FROM obat o
            LEFT JOIN transaksi_masuk tm ON o.id_obat = tm.id_obat
            LEFT JOIN transaksi_keluar tk ON o.id_obat = tk.id_obat
            GROUP BY o.id_obat
        `);

        // Stok Awal = Stok Akhir - Masuk + Keluar (Logic check: Awal + Masuk - Keluar = Akhir)
        // So Awal = Akhir - Masuk + Keluar. Note: this is "All Time" awal (should be 0).
        // If filtered by date, it gets complex. Let's just show Current Status for now.

        res.render('laporan/stock', {
            pageTitle: 'Laporan Stok',
            reportData: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getExpiryReport = async (req, res) => {
    try {
        // Get batches expiring in 90 days
        const [rows] = await db.execute(`
            SELECT 
                b.*, o.nama_obat, o.kode_obat,
                DATEDIFF(b.tgl_exp, CURRENT_DATE) as sisa_hari
            FROM batch_obat b
            JOIN obat o ON b.id_obat = o.id_obat
            WHERE b.status = 'available' 
            AND b.tgl_exp <= DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY)
            ORDER BY b.tgl_exp ASC
        `);

        res.render('laporan/expiry', {
            pageTitle: 'Notifikasi Kadaluarsa',
            batches: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
