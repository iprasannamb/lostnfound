function sanitizeText(value, maxLength = 255) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).trim().replace(/[<>]/g, '');
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

function sanitizeDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

module.exports = {
  sanitizeText,
  sanitizeDate,
  parseOptionalInt
};