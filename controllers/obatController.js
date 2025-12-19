const Obat = require('../models/obatModel');
const Batch = require('../models/batchModel');
const Transaksi = require('../models/transaksiModel');

exports.getInputPage = (req, res) => {
    res.render('obat/input', {
        pageTitle: 'Input Obat Baru',
        success: req.query.success,
        error: req.query.error
    });
};

exports.addObat = async (req, res) => {
    // Transactional logic ideally, here we do serial
    const { kode_obat, nama_obat, satuan, batch_code, tgl_masuk, tgl_exp, jumlah } = req.body;

    try {
        if (new Date(tgl_exp) <= new Date(tgl_masuk)) {
            return res.render('obat/input', {
                pageTitle: 'Input Obat Baru',
                error: 'Tanggal Expired harus lebih besar dari Tanggal Masuk',
                success: null
            });
        }

        // Check if drug exists (by code or name)
        // For simplicity, we assume if kode_obat exists, we are adding to it, OR we reject duplicate kode_obat if name differs?
        // Spec says: Kode Obat unique.
        // But what if user inputs existing code? We should probably just add batch to it.
        // However, spec says "Input Medicine" page seems to imply creating new OR adding stock.
        // Let's implement: Try find by Kode. 

        // Actually, if it's a new batch for existing medicine, we should probably autofill name/satuan.
        // Here we just handle it:

        let obat = await Obat.getAll(kode_obat); // Searching by code... wait getAll does LIKE search on name/code.
        // Let's implement specific find by code method details later, for now we assume new or exact match

        // Better approach:
        // Try to insert Obat. If duplicate entry error for kode_obat, fetch its ID.

        let id_obat;
        try {
            id_obat = await Obat.create({ kode_obat, nama_obat, satuan, stok_total: 0 });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Fetch existing
                const existingObats = await Obat.getAll(kode_obat);
                // getAll returns array matching search.
                // let's do a strict getByCode if we had it, but filter here:
                const existing = existingObats.find(o => o.kode_obat === kode_obat);
                if (existing) {
                    id_obat = existing.id_obat;
                    // Optional: Update nama/satuan if changed? Let's skip for now.
                } else {
                    throw new Error('Database Error on Duplicate Check');
                }
            } else {
                throw err;
            }
        }

        // Create Batch
        const id_batch = await Batch.create({
            id_obat,
            batch_code,
            jumlah,
            tgl_masuk,
            tgl_exp
        });

        // Update Total Stok
        const currentObat = await Obat.getById(id_obat);
        await Obat.updateStok(id_obat, currentObat.stok_total + parseInt(jumlah));

        // Log Transaction Masuk
        await Transaksi.createMasuk({
            id_obat,
            id_batch,
            jumlah,
            tgl_masuk,
            id_user: req.session.user.id
        });

        res.redirect('/obat/input?success=Data obat berhasil disimpan');

    } catch (error) {
        console.error(error);
        res.render('obat/input', {
            pageTitle: 'Input Obat Baru',
            error: 'Terjadi kesalahan: ' + error.message,
            success: null
        });
    }
};

exports.getList = async (req, res) => {
    try {
        const search = req.query.q || '';
        const obats = await Obat.getAll(search);
        res.render('obat/list', {
            pageTitle: 'Daftar Obat',
            obats,
            search
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getBatchDetails = async (req, res) => {
    try {
        const id_obat = req.params.id;
        const batches = await Batch.getByObatId(id_obat);
        res.json(batches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
