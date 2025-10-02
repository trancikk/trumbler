import { Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { PaymentMethod } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, paymentMethod, cryptoTxId } = req.body;

    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_contentId: {
          userId: req.userId!,
          contentId
        }
      }
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'Content already purchased' });
    }

    let paymentId: string;

    if (paymentMethod === 'CARD') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(content.price.toString()) * 100),
        currency: 'usd',
        metadata: {
          userId: req.userId!,
          contentId
        }
      });
      paymentId = paymentIntent.id;
    } else if (paymentMethod === 'CRYPTO') {
      if (!cryptoTxId) {
        return res.status(400).json({ error: 'Crypto transaction ID required' });
      }
      paymentId = cryptoTxId;
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: req.userId!,
        contentId,
        amount: content.price,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentId
      },
      include: {
        content: {
          include: {
            creator: true,
            categories: true,
            tags: true
          }
        }
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.userId! },
      include: {
        content: {
          include: {
            creator: true,
            categories: true,
            tags: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(purchases);
  } catch (error) {
    console.error('Purchases fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
