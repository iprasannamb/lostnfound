const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  listMatches,
  approveMatch,
  rejectMatch,
  rematchCandidates
} = require('../controllers/adminMatchController');

router.get('/matches', auth, authorize('admin'), listMatches);
router.patch('/matches/:id/approve', auth, authorize('admin'), approveMatch);
router.patch('/matches/:id/reject', auth, authorize('admin'), rejectMatch);
router.post('/matches/rematch', auth, authorize('admin'), rematchCandidates);

module.exports = router;