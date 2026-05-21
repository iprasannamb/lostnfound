function createRateLimiter({ windowMs = 60000, max = 60 } = {}) {
  const bucket = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = bucket.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    bucket.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    return next();
  };
}

module.exports = { createRateLimiter };