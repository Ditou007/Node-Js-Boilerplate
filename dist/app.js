"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const userRoutes_1 = __importDefault(require("./routes/userRoutes")); // Import the user routes
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const port = 3000;
// Initialize and connect to the database
(0, database_1.connectDatabase)();
// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Middleware for serving static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Middleware for logging requests
app.use(logger_1.requestLogger);
// Use the modularized routes
app.use('/users', userRoutes_1.default);
// Main index route
app.get('/', (req, res) => {
    res.render('index');
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
