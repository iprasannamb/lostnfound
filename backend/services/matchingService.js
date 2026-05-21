const LostItem = require('../models/lostModel');
const FoundItem = require('../models/foundModel');
const MatchCandidate = require('../models/matchCandidateModel');

const MATCH_THRESHOLD = Number(process.env.MATCH_THRESHOLD || 55);

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toKeywordSet(value) {
  const text = normalizeText(value);
  if (!text) return new Set();
  const words = text.split(' ').filter((word) => word.length >= 3);
  return new Set(words);
}

function tokenSimilarity(a, b) {
  const aSet = toKeywordSet(a);
  const bSet = toKeywordSet(b);
  if (!aSet.size || !bSet.size) return 0;

  let overlap = 0;
  for (const token of aSet) {
    if (bSet.has(token)) overlap += 1;
  }
  return overlap / Math.max(aSet.size, bSet.size);
}

function calculateDateScore(dateA, dateB) {
  if (!dateA || !dateB) return 0;
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const days = Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 2) return 15;
  if (days <= 7) return 10;
  if (days <= 14) return 5;
  return 0;
}

function calculateLocationScore(locationA, locationB) {
  const sim = tokenSimilarity(locationA, locationB);
  if (sim >= 0.75) return 15;
  if (sim >= 0.4) return 8;
  return 0;
}

function calculateMatchScore(lostItem, foundItem) {
  let score = 0;

  if (lostItem.category_id && foundItem.category_id && Number(lostItem.category_id) === Number(foundItem.category_id)) {
    score += 30;
  }

  const keywordSim = tokenSimilarity(
    `${lostItem.title || ''} ${lostItem.description || ''}`,
    `${foundItem.title || ''} ${foundItem.description || ''}`
  );
  if (keywordSim >= 0.5) score += 25;
  else if (keywordSim >= 0.25) score += 12;

  const titleSim = tokenSimilarity(lostItem.title, foundItem.title);
  if (titleSim >= 0.66) score += 20;
  else if (titleSim >= 0.33) score += 10;

  if (lostItem.color && foundItem.color && normalizeText(lostItem.color) === normalizeText(foundItem.color)) {
    score += 10;
  }

  score += calculateDateScore(lostItem.date_lost, foundItem.date_found);
  score += calculateLocationScore(lostItem.location_lost, foundItem.location_found);

  return Math.min(score, 100);
}

async function evaluateAndCreateCandidatesForFound(foundItemId) {
  const foundItem = await FoundItem.findById(foundItemId);
  if (!foundItem) return { created: 0 };

  const lostItems = await LostItem.listOpenForMatching();
  let created = 0;

  for (const lostItem of lostItems) {
    const score = calculateMatchScore(lostItem, foundItem);
    if (score >= MATCH_THRESHOLD) {
      await MatchCandidate.upsert({
        lost_item_id: lostItem.id,
        found_item_id: foundItem.id,
        score
      });
      created += 1;
    }
  }

  if (created > 0) {
    await FoundItem.updateStatus(foundItem.id, 'possible_match');
  }

  return { created };
}

async function evaluateAndCreateCandidatesForLost(lostItemId) {
  const lostItem = await LostItem.findById(lostItemId);
  if (!lostItem) return { created: 0 };

  const foundItems = await FoundItem.listOpenForMatching();
  let created = 0;

  for (const foundItem of foundItems) {
    const score = calculateMatchScore(lostItem, foundItem);
    if (score >= MATCH_THRESHOLD) {
      await MatchCandidate.upsert({
        lost_item_id: lostItem.id,
        found_item_id: foundItem.id,
        score
      });
      created += 1;
    }
  }

  if (created > 0) {
    await LostItem.updateStatus(lostItem.id, 'match_found');
  }

  return { created };
}

async function rematchAllOpenItems() {
  const lostItems = await LostItem.listOpenForMatching();
  const foundItems = await FoundItem.listOpenForMatching();
  let created = 0;

  for (const lostItem of lostItems) {
    for (const foundItem of foundItems) {
      const score = calculateMatchScore(lostItem, foundItem);
      if (score >= MATCH_THRESHOLD) {
        await MatchCandidate.upsert({
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          score
        });
        created += 1;
      }
    }
  }

  return {
    created,
    scannedLost: lostItems.length,
    scannedFound: foundItems.length
  };
}

module.exports = {
  MATCH_THRESHOLD,
  calculateMatchScore,
  evaluateAndCreateCandidatesForFound,
  evaluateAndCreateCandidatesForLost,
  rematchAllOpenItems
};