const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } = require("../config");

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: 5,
  message: "Too many login attempts; please try again later.",
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true
});

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  message: "Too many requests; please slow down.",
  keyGenerator: (req) => req.user?.id || req.ip
});

module.exports = { authLimiter, apiLimiter };
