const Claim = require('../models/claimModel');

const submitClaim = async (req, res, next) => {
  try {
    const data = {
      user_id: req.user.id,
      item_type: req.body.item_type, // 'lost' or 'found'
      item_id: req.body.item_id,
      details: req.body.details,
      proof_path: req.file ? `/uploads/${req.file.filename}` : null
    };
    const result = await Claim.create(data);
    res.status(201).json({ message: 'Claim submitted', id: result.id });
  } catch (err) { next(err); }
};

module.exports = { submitClaim };
