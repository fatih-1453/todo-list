
import { db } from './src/config/database';
import { users } from './src/db/schema/users';
import { employees } from './src/db/schema/employees';
import { eq } from 'drizzle-orm';

async function syncPhoto() {
    try {
        const employee = await db.query.employees.findFirst({
            where: eq(employees.email, 'muhammadsinaalfatih@gmail.com')
        });

        if (employee && employee.photoUrl) {
            await db.update(users)
                .set({ image: employee.photoUrl })
                .where(eq(users.email, 'muhammadsinaalfatih@gmail.com'));
            console.log('Successfully synced photo for', employee.name);
        } else {
            console.log('No employee found or no photoUrl');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncPhoto();
