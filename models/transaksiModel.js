const db = require('../config/database');

class Transaksi {
    static async createMasuk(data) {
        const { id_obat, id_batch, jumlah, tgl_masuk, id_user } = data;
        await db.execute(
            'INSERT INTO transaksi_masuk (id_obat, id_batch, jumlah, tgl_masuk, id_user) VALUES (?, ?, ?, ?, ?)',
            [id_obat, id_batch, jumlah, tgl_masuk, id_user]
        );
    }

    static async createKeluar(data) {
        const { id_obat, id_batch, jumlah, tgl_keluar, id_user } = data;
        await db.execute(
            'INSERT INTO transaksi_keluar (id_obat, id_batch, jumlah, tgl_keluar, id_user) VALUES (?, ?, ?, ?, ?)',
            [id_obat, id_batch, jumlah, tgl_keluar, id_user]
        );
    }
}

module.exports = Transaksi;
