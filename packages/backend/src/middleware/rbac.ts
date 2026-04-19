import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './error';

// Permission flags that can be checked
type AdminPermission =
    | 'canApproveNgos'
    | 'canManageUsers'
    | 'canManageContent'
    | 'canViewAnalytics'
    | 'canManageAdmins';

// Middleware that checks if the authenticated user has the required role
// Usage: router.get('/admin', authenticate, requireRole('ADMIN'), controller)
export const requireRole = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        if (!roles.includes(req.user.role as Role)) {
            throw new AppError(
            'You do not have permission to access this resource',
            403
            );
        }

        next();
        } catch (error) {
        next(error);
        }
    };
};

// Middleware that checks if the authenticated user has a specific permission flag
// Usage: router.get('/ngos/approve', authenticate, requirePermission('canApproveNgos'), controller)
export const requirePermission = (permission: AdminPermission) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        // SUPER_ADMIN always passes — no permission check needed
        if (req.user.role === Role.SUPER_ADMIN) {
            return next();
        }

        // ADMIN must have the specific permission flag enabled
        if (req.user.role === Role.ADMIN && req.user[permission]) {
            return next();
        }

        throw new AppError(
            'You do not have permission to perform this action',
            403
        );
        } catch (error) {
        next(error);
        }
    };
};

// Middleware that checks if the user is accessing their own resource
// Prevents donors from viewing other donors' data
// Usage: router.get('/users/:id', authenticate, requireOwnership(), controller)
export const requireOwnership = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        // SUPER_ADMIN and ADMIN can access any resource
        if (
            req.user.role === Role.SUPER_ADMIN ||
            req.user.role === Role.ADMIN
        ) {
            return next();
        }

        // Everyone else can only access their own resources
        if (req.params.id !== req.user.id) {
            throw new AppError(
            'You do not have permission to access this resource',
            403
            );
        }

        next();
        } catch (error) {
        next(error);
        }
    };
};

// Convenience middleware combinations
// These are the most common patterns we will use across routes

// Only SUPER_ADMIN
export const superAdminOnly = [requireRole(Role.SUPER_ADMIN)];

// SUPER_ADMIN or ADMIN
export const adminOnly = [requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

// SUPER_ADMIN, ADMIN, or NGO
export const ngoAndAbove = [
    requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.NGO),
];

// Any authenticated user
export const anyRole = [
    requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.NGO, Role.DONOR),
];