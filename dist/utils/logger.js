"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const startHrTime = process.hrtime();
    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
        console.log(`[${new Date().toISOString()}] ${req.method} to ${req.originalUrl} | Status: ${res.statusCode} | Elapsed Time: ${elapsedTimeInMs.toFixed(3)}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
