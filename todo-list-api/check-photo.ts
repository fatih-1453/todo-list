import { db } from './src/config/database';
import { users } from './src/db/schema/users';

async function checkEmployee() {
    try {
        const _employees = await db.query.employees.findMany();
        const _users = await db.query.users.findMany();

        console.log('Employees:', _employees.map(e => ({ name: e.name, email: e.email, photoUrl: e.photoUrl })));
        console.log('Users:', _users.map(u => ({ name: u.name, email: u.email, image: u.image })));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkEmployee();
