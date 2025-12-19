const db = require('../config/database');

class Batch {
    static async create(batchData) {
        const { id_obat, batch_code, jumlah, tgl_masuk, tgl_exp } = batchData;
        const [result] = await db.execute(
            'INSERT INTO batch_obat (id_obat, batch_code, jumlah, tgl_masuk, tgl_exp, status) VALUES (?, ?, ?, ?, ?, ?)',
            [id_obat, batch_code, jumlah, tgl_masuk, tgl_exp, 'available']
        );
        return result.insertId;
    }

    static async getByObatId(id_obat) {
        const [rows] = await db.execute(
            'SELECT * FROM batch_obat WHERE id_obat = ? ORDER BY tgl_masuk ASC',
            [id_obat]
        );
        return rows;
    }

    static async getAvailableBatches(id_obat) {
        // FIFO Priority: tgl_masuk ASC
        const [rows] = await db.execute(
            "SELECT * FROM batch_obat WHERE id_obat = ? AND status = 'available' AND jumlah > 0 ORDER BY tgl_masuk ASC",
            [id_obat]
        );
        return rows;
    }

    static async update(id, updates) {
        const { jumlah, status } = updates;
        let query = 'UPDATE batch_obat SET ';
        let params = [];

        if (jumlah !== undefined) {
            query += 'jumlah = ?, ';
            params.push(jumlah);
        }
        if (status) {
            query += 'status = ?, ';
            params.push(status);
        }

        // Remove trailing comma
        query = query.slice(0, -2);
        query += ' WHERE id_batch = ?';
        params.push(id);

        await db.execute(query, params);
    }
}

module.exports = Batch;
