import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import vaultRoutes from './routes/vaultRoutes';
import trustRoutes from './routes/trustRoutes';
import entityRoutes from './routes/entityRoutes';
import aiRoutes from './routes/aiRoutes';
import twofaRoutes from './routes/2faRoutes';
import checkInRoutes from './routes/checkInRoutes';
import protectionScoreRoutes from './routes/protectionScoreRoutes';
import fraudRoutes from './routes/fraudRoutes';
import financialRoutes from './routes/financialRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import legacyRoutes from './routes/legacyRoutes';
import notificationRoutes from './routes/notificationRoutes';
import regulatoryRoutes from './routes/regulatoryRoutes';
import auditRoutes from './routes/auditRoutes';
import searchRoutes from './routes/searchRoutes';
import pushRoutes from './routes/pushRoutes';
import adminBackupRoutes from './routes/adminRoutes';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes';
import { verifyAuth } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/vault', verifyAuth, vaultRoutes);
app.use('/api/trust', verifyAuth, trustRoutes);
app.use('/api/entity', verifyAuth, entityRoutes);
app.use('/api/ai', verifyAuth, aiRoutes);
app.use('/api/2fa', verifyAuth, twofaRoutes);
app.use('/api/checkins', verifyAuth, checkInRoutes);
app.use('/api/protection-score', verifyAuth, protectionScoreRoutes);
app.use('/api/fraud', verifyAuth, fraudRoutes);
app.use('/api/financial', verifyAuth, financialRoutes);
app.use('/api/onboarding', verifyAuth, onboardingRoutes);
app.use('/api/legacy', verifyAuth, legacyRoutes);
app.use('/api/notifications', verifyAuth, notificationRoutes);
app.use('/api/regulatory', verifyAuth, regulatoryRoutes);
app.use('/api/audit-logs', verifyAuth, auditRoutes);
app.use('/api/search', verifyAuth, searchRoutes);
app.use('/api/push', verifyAuth, pushRoutes);
app.use('/api/admin/backups', verifyAuth, adminBackupRoutes);
app.use('/api/admin/analytics', verifyAuth, adminAnalyticsRoutes);

// Swagger docs
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
