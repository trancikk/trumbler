import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        creatorProfile: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        creatorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCreatorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { paypalEmail, cryptoAddress, billingInfo } = req.body;

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.userId! }
    });

    if (!creatorProfile) {
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    const updated = await prisma.creatorProfile.update({
      where: { userId: req.userId! },
      data: {
        paypalEmail,
        cryptoAddress,
        billingInfo
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
