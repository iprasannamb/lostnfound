const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createLost, listLost, getLostById } = require('../controllers/lostController');

router.get('/', listLost);
router.get('/:id', getLostById);
router.post('/', auth, upload.single('image'), createLost);

module.exports = router;
