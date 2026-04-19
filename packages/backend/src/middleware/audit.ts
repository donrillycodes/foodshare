import { Request, Response, NextFunction } from 'express';
import { AuditAction, AuditEntityType, ActorRole } from '@prisma/client';
import db from '../config/database';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

//Shape of an udit log entry
interface AuditLogEntry {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    previousState?: Prisma.InputJsonValue;
    newState?: Prisma.InputJsonValue;
    notes?: string;
}

// Core function that writes to the AuditLog table
// This is called directly from services when significant actions occur
// It never throws — audit logging should never break the main flow
export const writeAuditLog = async (
    req: Request,
    entry: AuditLogEntry
): Promise<void> => {
    try {
        await db.auditLog.create({
            data: {
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId,
                previousState: entry.previousState ?? Prisma.JsonNull,
                newState: entry.newState ?? Prisma.JsonNull,
                notes: entry.notes ?? undefined,
                actorId: req.user?.id ?? null,
                actorRole: (req.user?.role as ActorRole) ?? ActorRole.SYSTEM,
                ipAddress: getClientIp(req),
                userAgent: req.headers['user-agent'] ?? null,
            },
        });
    } catch (error) {
        // We log the error but never throw it
        // A failed audit log should never break the user's request
        // The main operation has already succeeded at this point
        logger.error('Failed to write audit log', { error, entry });
    }
};

// System audit log — for automated actions with no human actor
// Used by cron jobs for pledge expiry, notification cleanup etc.
export const writeSystemAuditLog = async (
    entry: AuditLogEntry
): Promise<void> => {
    try {
        await db.auditLog.create({
            data: {
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId,
                previousState: entry.previousState ?? Prisma.JsonNull,
                newState: entry.newState ?? Prisma.JsonNull,
                notes: entry.notes ?? undefined,
                actorId: null,
                actorRole: ActorRole.SYSTEM,
                ipAddress: null,
                userAgent: null,
            },
        });
    } catch (error) {
        logger.error('Failed to write system audit log', { error, entry });
    }
};

// Extracts the real client IP address from the request
// Handles cases where the API is behind a proxy or load balancer
const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];

    if (forwarded) {
        // x-forwarded-for can contain multiple IPs — we want the first one
        // which is the original client IP
        const ips = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0];
        return ips.trim();
    }

    return req.socket.remoteAddress ?? 'unknown';
};