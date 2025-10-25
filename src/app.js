const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const dotenv = require('dotenv');
const { initDB, closeDB } = require('./config/veritabani');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// JSON Error handling
app.use((err, req, res, next) => {
    // In production don't leak stack traces to clients
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    } else {
        console.error(err.message);
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

// Start the server AFTER DB init
const PORT = process.env.PORT || 3000;
(async () => {
    await initDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();

// Handle unhandled rejections and uncaught exceptions by closing DB and exiting
process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    try {
        await closeDB();
    } catch (err) {
        console.error('Error closing DB after unhandledRejection:', err);
    }
    process.exit(1);
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    try {
        await closeDB();
    } catch (e) {
        console.error('Error closing DB after uncaughtException:', e);
    }
    process.exit(1);
});