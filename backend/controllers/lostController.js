const LostItem = require('../models/lostModel');

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

const createLost = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.location_lost || !req.body.contact_info) {
      return res.status(400).json({ message: 'title, location_lost and contact_info are required' });
    }

    const categoryId = parseOptionalInt(req.body.category_id);
    if (req.body.category_id && categoryId === null) {
      return res.status(400).json({ message: 'category_id must be a valid number' });
    }

    const data = {
      user_id: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category_id: categoryId,
      date_lost: req.body.date_lost,
      location_lost: req.body.location_lost,
      contact_info: req.body.contact_info,
      image_path: req.file ? `/uploads/${req.file.filename}` : null
    };
    const result = await LostItem.create(data);
    res.status(201).json({ message: 'Lost item reported', id: result.id });
  } catch (err) {
    next(err);
  }
};

const listLost = async (req, res, next) => {
  try {
    const items = await LostItem.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      category: req.query.category,
      status: req.query.status,
      q: req.query.q
    });
    res.json(items);
  } catch (err) { next(err); }
};

const getLostById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

module.exports = { createLost, listLost, getLostById };
