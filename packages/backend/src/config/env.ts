import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
    "DATABASE_URL",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "PORT",
    "NODE_ENV",
    "CLIENT_URL",
] as const;

// Validate all required environment variables are present at startup
// This prevents the server from starting with missing config
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const env = {
    // Server
    port: parseInt(process.env.PORT as string, 10),
    nodeEnv: process.env.NODE_ENV as "development" | "production" | "test",
    clientUrl: process.env.CLIENT_URL as string,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",

    // Database
    databaseUrl: process.env.DATABASE_URL as string,

    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
    },

    // Stripe
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY as string,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
    },
} as const;
