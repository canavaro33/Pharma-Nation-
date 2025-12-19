const Obat = require('../models/obatModel');
const Batch = require('../models/batchModel');
const Transaksi = require('../models/transaksiModel');

exports.getFifoPage = async (req, res) => {
    try {
        const obats = await Obat.getAll();
        res.render('transaksi/fifo', {
            pageTitle: 'Transaksi Keluar (FIFO)',
            obats,
            success: req.query.success,
            error: req.query.error,
            preview: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.previewFifo = async (req, res) => {
    // This function calculates what WOULD happen and shows confirmation modal/page
    const { id_obat, jumlah_keluar } = req.body;

    try {
        const obat = await Obat.getById(id_obat);
        const batches = await Batch.getAvailableBatches(id_obat);
        const obats = await Obat.getAll(); // For re-rendering dropdown

        if (obat.stok_total < jumlah_keluar) {
            return res.render('transaksi/fifo', {
                pageTitle: 'Transaksi Keluar (FIFO)',
                obats,
                error: `Stok tidak mencukupi! Total Stok: ${obat.stok_total}, Permintaan: ${jumlah_keluar}`,
                success: null,
                preview: null
            });
        }

        let sisa = parseInt(jumlah_keluar);
        let previewDetails = [];

        for (const batch of batches) {
            if (sisa <= 0) break;

            let ambil = 0;
            if (batch.jumlah >= sisa) {
                ambil = sisa;
                sisa = 0;
            } else {
                ambil = batch.jumlah;
                sisa -= batch.jumlah;
            }

            previewDetails.push({
                batch_code: batch.batch_code,
                tgl_masuk: batch.tgl_masuk,
                stok_awal: batch.jumlah,
                diambil: ambil,
                stok_akhir: batch.jumlah - ambil,
                id_batch: batch.id_batch
            });
        }

        res.render('transaksi/fifo', {
            pageTitle: 'Konfirmasi Transaksi FIFO',
            obats,
            success: null,
            error: null,
            preview: {
                obat,
                jumlah_keluar,
                details: previewDetails
            }
        });

    } catch (error) {
        console.error(error);
        res.redirect('/transaksi/fifo?error=Server Error');
    }
};

exports.processFifo = async (req, res) => {
    const { id_obat, jumlah_keluar } = req.body;

    try {
        const obat = await Obat.getById(id_obat);
        const batches = await Batch.getAvailableBatches(id_obat); // Ordered by tgl_masuk ASC

        if (obat.stok_total < jumlah_keluar) {
            return res.redirect('/transaksi/fifo?error=Stok berubah saat pemrosesan, transaksi dibatalkan.');
        }

        let sisa = parseInt(jumlah_keluar);
        const tgl_keluar = new Date();

        for (const batch of batches) {
            if (sisa <= 0) break;

            let ambil = 0;
            let status = 'available';

            if (batch.jumlah >= sisa) {
                ambil = sisa;
                batch.jumlah -= sisa;
                sisa = 0;
            } else {
                ambil = batch.jumlah;
                sisa -= batch.jumlah;
                batch.jumlah = 0;
                status = 'sold_out';
            }

            if (batch.jumlah === 0) status = 'sold_out';

            // Update Batch
            await Batch.update(batch.id_batch, { jumlah: batch.jumlah, status });

            // Record Transaksi
            await Transaksi.createKeluar({
                id_obat,
                id_batch: batch.id_batch,
                jumlah: ambil,
                tgl_keluar,
                id_user: req.session.user.id
            });
        }

        // Update Obat Total
        await Obat.updateStok(id_obat, obat.stok_total - parseInt(jumlah_keluar));

        res.redirect('/transaksi/fifo?success=Transaksi FIFO Berhasil Diproses!');

    } catch (error) {
        console.error(error);
        res.redirect('/transaksi/fifo?error=Terjadi kesalahan saat memproses transaksi.');
    }
};
