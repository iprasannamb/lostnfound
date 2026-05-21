const FoundItem = require('../models/foundModel');

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

const createFound = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.location_found || !req.body.contact_info) {
      return res.status(400).json({ message: 'title, location_found and contact_info are required' });
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
      date_found: req.body.date_found,
      location_found: req.body.location_found,
      contact_info: req.body.contact_info,
      image_path: req.file ? `/uploads/${req.file.filename}` : null
    };
    const result = await FoundItem.create(data);
    res.status(201).json({ message: 'Found item reported', id: result.id });
  } catch (err) { next(err); }
};

const listFound = async (req, res, next) => {
  try {
    const items = await FoundItem.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      category: req.query.category,
      status: req.query.status,
      q: req.query.q
    });
    res.json(items);
  } catch (err) { next(err); }
};

const getFoundById = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Found item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

module.exports = { createFound, listFound, getFoundById };
