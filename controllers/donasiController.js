const db = require('../config/database');
const Obat = require('../models/obatModel');
const Batch = require('../models/batchModel');

exports.getIndex = async (req, res) => {
    try {
        // eligible: Expiring in 60 days
        const [eligibleBatches] = await db.execute(`
            SELECT b.*, o.nama_obat, o.satuan 
            FROM batch_obat b
            JOIN obat o ON b.id_obat = o.id_obat
            WHERE b.status = 'available' 
            AND b.tgl_exp <= DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY)
        `);

        // History
        const [history] = await db.execute(`
            SELECT d.*, o.nama_obat, b.batch_code 
            FROM donasi_obat d
            JOIN obat o ON d.id_obat = o.id_obat
            JOIN batch_obat b ON d.id_batch = b.id_batch
            ORDER BY d.created_at DESC
        `);

        res.render('donasi/index', {
            pageTitle: 'Manajemen Donasi',
            eligible: eligibleBatches,
            history,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.processDonation = async (req, res) => {
    const { id_batch, jumlah, penerima, tgl_donasi } = req.body;

    try {
        // Get Batch info
        const [batches] = await db.execute('SELECT * FROM batch_obat WHERE id_batch = ?', [id_batch]);
        if (batches.length === 0) throw new Error('Batch tidak ditemukan');
        const batch = batches[0];

        if (parseInt(jumlah) > batch.jumlah) {
            return res.redirect('/donations?error=Jumlah donasi melebihi stok tersedia');
        }

        const jumlahDonasi = parseInt(jumlah);
        let newStatus = batch.status;
        let newJumlah = batch.jumlah - jumlahDonasi;

        if (newJumlah === 0) {
            newStatus = 'donated'; // or 'sold_out' but for donation logical tracking 'donated' is better if batch fully donated? 
            // Spec says: "ubah status jadi 'donated' jika habis"
            newStatus = 'donated';
        }

        // Update Batch
        await Batch.update(id_batch, { jumlah: newJumlah, status: newStatus });

        // Update Total Stok Obat
        // Get current total
        const obat = await Obat.getById(batch.id_obat);
        await Obat.updateStok(batch.id_obat, obat.stok_total - jumlahDonasi);

        // Insert Donasi Record
        await db.execute(
            'INSERT INTO donasi_obat (id_obat, id_batch, jumlah, penerima, status, tgl_donasi, id_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [batch.id_obat, id_batch, jumlahDonasi, penerima, 'Pending', tgl_donasi, req.session.user.id]
        );

        res.redirect('/donations?success=Donasi berhasil dicatat');

    } catch (error) {
        console.error(error);
        res.redirect('/donations?error=Gagal memproses donasi: ' + error.message);
    }
};

exports.updateStatus = async (req, res) => {
    const { id_donasi, status } = req.body;
    try {
        await db.execute('UPDATE donasi_obat SET status = ? WHERE id_donasi = ?', [status, id_donasi]);
        res.redirect('/donations?success=Status donasi diperbarui');
    } catch (error) {
        console.error(error);
        res.redirect('/donations?error=Gagal update status');
    }
}
