import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const seedAdmin = async () => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        console.error("Please provide ADMIN_EMAIL and ADMIN_PASSWORD in your .env file or command line.");
        process.exit(1);
    }

    try {
        const { auth } = await import('@/lib/auth');
        
        console.log(`Attempting to create admin user: ${process.env.ADMIN_EMAIL}`);
        
        // We bypass headers since this is a local script
        const user = await auth.api.signUpEmail({
            body: {
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                name: "Admin User",
            }
        });

        console.log("Admin user created successfully!", user);
    } catch (error) {
        console.error("Failed to create admin user:", error);
    }
    
    process.exit(0);
};

seedAdmin();
