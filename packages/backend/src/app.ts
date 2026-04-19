import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/error';
import { env } from './config/env';
import logger from './utils/logger';

const app: Application = express();

// ── Security middleware ────────────────────────────────────────────────────────

// Helmet adds a set of HTTP headers that protect against common web attacks
// including clickjacking, cross-site scripting, and protocol downgrade attacks
app.use(helmet());

// CORS — controls which origins can make requests to our API
// In development we allow the local Next.js dashboard and Expo mobile app
// In production we restrict to our actual domain
app.use(
    cors({
        origin: (origin, callback) => {
        const allowedOrigins = [
            env.clientUrl,
            'http://localhost:3000', // Next.js dashboard
            'http://localhost:8081', // Expo mobile app
        ];

        // Allow requests with no origin — mobile apps and Postman
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ── Request parsing middleware ─────────────────────────────────────────────────

// Parse incoming JSON request bodies
// limit prevents large payload attacks where someone sends a huge JSON body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging middleware ─────────────────────────────────────────────────────────

// Morgan logs every incoming request in development
// We use a custom format that integrates with our Winston logger
if (env.isDevelopment) {
    app.use(
        morgan('combined', {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
        })
    );
}

// ── Rate limiting ──────────────────────────────────────────────────────────────

// Apply general rate limiter to all routes
app.use(generalLimiter);

// ── Health check ───────────────────────────────────────────────────────────────

// Simple endpoint to verify the API is running
// Used by Railway and BetterStack for uptime monitoring
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

// ── API routes ─────────────────────────────────────────────────────────────────

// Routes will be added here as we build them
// Example: app.use('/api/auth', authRoutes);
// Example: app.use('/api/users', userRoutes);
// Example: app.use('/api/ngos', ngoRoutes);
// Example: app.use('/api/donations', donationRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────

// Catches any request to a route that does not exist
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});

// ── Global error handler ───────────────────────────────────────────────────────

// Must be last — catches all errors thrown anywhere in the application
// The four parameters are required for Express to recognise this as an error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

export default app;