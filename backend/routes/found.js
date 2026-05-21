const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createFound, listFound, getFoundById } = require('../controllers/foundController');

router.get('/', listFound);
router.get('/:id', getFoundById);
router.post('/', auth, upload.single('image'), createFound);

module.exports = router;
