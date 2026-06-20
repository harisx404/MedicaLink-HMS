import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  isDev
    ? winston.format.colorize({ all: true })
    : winston.format.uncolorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: isDev ? 'debug' : 'info',
    format: logFormat,
  }),
];

// Always write to rotating log files for easier debugging locally
const logsDir = path.join(process.cwd(), 'logs');

transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  })
);

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports,
  exceptionHandlers: [
    new winston.transports.Console({ format: logFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: logFormat }),
  ],
  exitOnError: false,
});
