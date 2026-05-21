const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const lostRoutes = require('./routes/lost');
const foundRoutes = require('./routes/found');
const claimRoutes = require('./routes/claims');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostRoutes);
app.use('/api/found-items', foundRoutes);
app.use('/api/claims', claimRoutes);

app.use(errorHandler);

module.exports = app;
