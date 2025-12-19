const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedUser() {
    try {
        const username = 'admin';
        const password = 'halomok123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cek existing
        const [rows] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
        if (rows.length > 0) {
            console.log('User admin already exists.');
            process.exit();
            return;
        }

        await db.execute(
            'INSERT INTO user (nama, username, password, role) VALUES (?, ?, ?, ?)',
            ['Administrator', username, hashedPassword, 'Admin']
        );

        console.log('Admin user seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
}

seedUser();
