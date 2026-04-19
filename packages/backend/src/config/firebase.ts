import * as admin from 'firebase-admin';
import { env } from './env';
import logger from '../utils/logger';

// Initialize Firebase Admin SDK
// This is the server-side Firebase SDK
// It is different from the client-side SDK used in the mobile app
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
        }),
    });

    logger.info('Firebase Admin SDK initialized successfully');
}

export default admin;