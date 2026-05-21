const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const lostRoutes = require('./routes/lost');
const foundRoutes = require('./routes/found');
const claimRoutes = require('./routes/claims');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const { createRateLimiter } = require('./middleware/rateLimit');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

const authLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 });
const adminLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 50 });

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/lost-items', lostRoutes);
app.use('/api/found-items', foundRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

module.exports = app;
