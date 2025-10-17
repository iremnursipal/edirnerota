const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const dotenv = require('dotenv');
const { initDB } = require('./config/veritabani');
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
    console.error(err.stack);
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