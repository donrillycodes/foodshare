import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/apiResponse';
import logger from '../utils/logger';

// Custom error class for operational errors
// These are errors we expect and handle deliberately
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // Captures the stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

// Handles Prisma database errors and converts them to readable messages
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
    switch (error.code) {
        case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ');
        return new AppError(
            `A record with this ${field} already exists.`,
            409
        );
        case 'P2025':
        // Record not found
        return new AppError('Record not found.', 404);
        case 'P2003':
        // Foreign key constraint violation
        return new AppError('Related record not found.', 400);
        case 'P2014':
        // Relation violation
        return new AppError('Invalid relation between records.', 400);
        default:
        return new AppError('A database error occurred.', 500);
    }
};

// Global error handling middleware
// This is the last middleware in the chain
// It catches every error thrown anywhere in the application
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Log every error with full details
    logger.error({
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    // Handle Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const appError = handlePrismaError(error);
        sendError({
        res,
        statusCode: appError.statusCode,
        message: appError.message,
        });
        return;
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        sendError({
        res,
        statusCode: 400,
        message: 'Invalid data provided.',
        });
        return;
    }

    // Handle our own operational errors
    if (error instanceof AppError && error.isOperational) {
        sendError({
        res,
        statusCode: error.statusCode,
        message: error.message,
        });
        return;
    }

    // Handle unexpected errors
    // We never expose internal error details to the client in production
    sendError({
        res,
        statusCode: 500,
        message: 'Something went wrong. Please try again later.',
    });
};