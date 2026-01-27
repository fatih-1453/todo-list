
import { db } from '../src/config/database';
import { users } from '../src/db/schema/tables';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function main() {
    const email = 'iksan@gmail.com';
    console.log(`Setting admin role for user: ${email}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email));

    console.log(`Successfully updated ${user.name} (${email}) to admin.`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
