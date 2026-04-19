import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format for development — human readable
const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack }) => {
        return stack
        ? `[${timestamp}] ${level}: ${message}\n${stack}`
        : `[${timestamp}] ${level}: ${message}`;
    })
);

// Custom log format for production — structured JSON for log aggregators
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: env.isDevelopment ? 'debug' : 'info',
    format: env.isDevelopment ? devFormat : prodFormat,
    transports: [
        new winston.transports.Console(),
    ],
});

export default logger;