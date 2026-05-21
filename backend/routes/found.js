const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const { createFound, listFound, getFoundById } = require('../controllers/foundController');

router.get('/', listFound);
router.get('/:id', optionalAuth, getFoundById);
router.post('/', auth, upload.single('image'), createFound);

module.exports = router;
