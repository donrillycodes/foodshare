import { Response } from 'express';

// Standard API response structure
// Every response from our API looks exactly the same
// This makes it predictable for the mobile app and web dashboard to handle

interface ApiResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  data?: unknown;
  errors?: unknown;
}

export const sendSuccess = ({
  res,
  statusCode = 200,
  message,
  data,
}: ApiResponseOptions): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = ({
  res,
  statusCode = 500,
  message,
  errors,
}: ApiResponseOptions): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
    timestamp: new Date().toISOString(),
  });
};

// Common response shortcuts
export const responses = {
  ok: (res: Response, message: string, data?: unknown) =>
    sendSuccess({ res, statusCode: 200, message, data }),

  created: (res: Response, message: string, data?: unknown) =>
    sendSuccess({ res, statusCode: 201, message, data }),

  badRequest: (res: Response, message: string, errors?: unknown) =>
    sendError({ res, statusCode: 400, message, errors }),

  unauthorized: (res: Response, message: string = 'Unauthorized') =>
    sendError({ res, statusCode: 401, message }),

  forbidden: (res: Response, message: string = 'Forbidden') =>
    sendError({ res, statusCode: 403, message }),

  notFound: (res: Response, message: string = 'Resource not found') =>
    sendError({ res, statusCode: 404, message }),

  conflict: (res: Response, message: string) =>
    sendError({ res, statusCode: 409, message }),

  serverError: (res: Response, message: string = 'Internal server error') =>
    sendError({ res, statusCode: 500, message }),
};
