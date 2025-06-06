require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const nextAuthRouter = require("./src/routes/auth");
const userRouter = require("./src/routes/users");
const subscriptionRouter = require("./src/routes/subscriptions");
const trustRouter = require("./src/routes/trusts");
const entityRouter = require("./src/routes/entities");
const vaultRouter = require("./src/routes/vault");
const aiRouter = require("./src/routes/ai");
const legacyLetterRouter = require("./src/routes/legacy-letter");
const protectionScoreRouter = require("./src/routes/protection-score");
const dashboardRouter = require("./src/routes/dashboard");
const adminRouter = require("./src/routes/admin");
const notificationRouter = require("./src/routes/notifications");
const searchRouter = require("./src/routes/search");
const pushTokenRouter = require("./src/routes/push-notifications");
const { authLimiter, apiLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");
const csrfProtection = require("./src/middleware/csrfProtection");

const app = express();
app.use(cors());
app.use(express.json());

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// CSRF Protection
app.use(csrfProtection);

// Routes
app.use("/api/auth", nextAuthRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/trusts", trustRouter);
app.use("/api/entities", entityRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/ai", aiRouter);
app.use("/api/legacy-letter", legacyLetterRouter);
app.use("/api/protection-score", protectionScoreRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/search", searchRouter);
app.use("/api/push-tokens", pushTokenRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`Legacy Pro backend running on port \${PORT}\`);
});
