const FoundItem = require('../models/foundModel');
const { evaluateAndCreateCandidatesForFound } = require('../services/matchingService');
const { sanitizeText, sanitizeDate, parseOptionalInt } = require('../utils/validation');

const createFound = async (req, res, next) => {
  try {
    const title = sanitizeText(req.body.title, 200);
    const location_found = sanitizeText(req.body.location_found, 255);
    const contact_info = sanitizeText(req.body.contact_info, 255);
    const description = sanitizeText(req.body.description, 2000);
    const color = sanitizeText(req.body.color, 80);
    const date_found = sanitizeDate(req.body.date_found);

    if (!title || !location_found) {
      return res.status(400).json({ message: 'title and location_found are required' });
    }

    const categoryId = parseOptionalInt(req.body.category_id);
    if (req.body.category_id && categoryId === null) {
      return res.status(400).json({ message: 'category_id must be a valid number' });
    }

    const data = {
      user_id: req.user.id,
      title,
      description,
      category_id: categoryId,
      color,
      date_found,
      location_found,
      contact_info,
      image_path: req.file ? `/uploads/${req.file.filename}` : null
    };
    const result = await FoundItem.create(data);
    const matching = await evaluateAndCreateCandidatesForFound(result.id);
    res.status(201).json({
      message: 'Found item reported',
      id: result.id,
      potentialMatchesCreated: matching.created
    });
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

    const isOwnerOrAdmin = req.user && (req.user.id === item.user_id || req.user.role === 'admin');
    if (!isOwnerOrAdmin) {
      delete item.contact_info;
      delete item.user_email;
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

module.exports = { createFound, listFound, getFoundById };
