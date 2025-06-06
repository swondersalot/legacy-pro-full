const { getToken } = require("next-auth/jwt");
const ApiError = require("../utils/ApiError");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) throw new ApiError(401, "Not authenticated");
    req.user = { id: token.sub, role: token.role || "USER" };
    next();
  } catch (err) {
    next(err);
  }
};
