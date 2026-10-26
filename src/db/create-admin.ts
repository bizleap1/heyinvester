import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });


const createAdmin = async () => {
    const { auth } = await import('../lib/auth');
    try {
        console.log("Creating admin user...");
        const res = await auth.api.signUpEmail({
            body: {
                email: 'admin@heyinvestor.in',
                password: 'password123',
                name: 'Super Admin'
            }
        });
        console.log("Admin created successfully:", res);
        process.exit(0);
    } catch (e) {
        console.error("Error creating admin:", e);
        process.exit(1);
    }
};

createAdmin();
