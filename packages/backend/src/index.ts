import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import purchaseRoutes from './routes/purchase';
import subscriptionRoutes from './routes/subscription';
import profileRoutes from './routes/profile';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
