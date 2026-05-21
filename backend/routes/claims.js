const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { submitClaim } = require('../controllers/claimController');

router.post('/', auth, upload.single('proof'), submitClaim);

module.exports = router;
