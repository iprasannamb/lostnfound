const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listMyNotifications } = require('../controllers/adminMatchController');

router.get('/', auth, listMyNotifications);

module.exports = router;