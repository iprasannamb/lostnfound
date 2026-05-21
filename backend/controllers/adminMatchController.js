const MatchCandidate = require('../models/matchCandidateModel');
const LostItem = require('../models/lostModel');
const FoundItem = require('../models/foundModel');
const Notification = require('../models/notificationModel');
const { rematchAllOpenItems } = require('../services/matchingService');

const listMatches = async (req, res, next) => {
  try {
    const status = (req.query.status || 'pending').toLowerCase();
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const matches = await MatchCandidate.list({ status, page, limit });
    res.json(matches);
  } catch (err) {
    next(err);
  }
};

const approveMatch = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid match id' });

    const match = await MatchCandidate.findById(id);
    if (!match) return res.status(404).json({ message: 'Match candidate not found' });
    if (match.status === 'rejected') return res.status(400).json({ message: 'Rejected match cannot be approved' });

    await MatchCandidate.review({ id, status: 'contacted', admin_id: req.user.id });
    await LostItem.updateStatus(match.lost_item_id, 'match_found');
    await FoundItem.updateStatus(match.found_item_id, 'possible_match');

    await Notification.create({
      user_id: match.lost_user_id,
      type: 'match_approved',
      message: `A probable match has been approved for your lost item #${match.lost_item_id}. Please review contact instructions.`,
      metadata: {
        matchCandidateId: id,
        lostItemId: match.lost_item_id,
        foundItemId: match.found_item_id,
        score: match.score,
        confidence: match.score >= 80 ? 'high' : match.score >= 65 ? 'medium' : 'moderate'
      }
    });

    res.json({ message: 'Match approved and user notified' });
  } catch (err) {
    next(err);
  }
};

const rejectMatch = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid match id' });

    const match = await MatchCandidate.findById(id);
    if (!match) return res.status(404).json({ message: 'Match candidate not found' });

    await MatchCandidate.review({ id, status: 'rejected', admin_id: req.user.id });
    res.json({ message: 'Match rejected' });
  } catch (err) {
    next(err);
  }
};

const listMyNotifications = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const notifications = await Notification.listForUser(req.user.id, { page, limit });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

const rematchCandidates = async (req, res, next) => {
  try {
    const result = await rematchAllOpenItems();
    res.json({
      message: 'Re-matching completed',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listMatches,
  approveMatch,
  rejectMatch,
  listMyNotifications,
  rematchCandidates
};