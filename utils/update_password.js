const db = require('../config/database');
const bcrypt = require('bcryptjs');

const newPassword = process.argv[2];

if (!newPassword) {
    console.error('Error: Masukkan password baru!');
    console.log('Cara pakai: node utils/update_password.js "password_baru_anda"');
    process.exit(1);
}

async function updatePassword() {
    try {
        const username = 'admin';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update di database
        const [result] = await db.execute(
            'UPDATE user SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Berhasil! Password untuk user "admin" telah diubah.');
        } else {
            console.error('❌ Gagal: User "admin" tidak ditemukan.');
        }

        process.exit();
    } catch (error) {
        console.error('Error updating password:', error);
        process.exit(1);
    }
}

updatePassword();
