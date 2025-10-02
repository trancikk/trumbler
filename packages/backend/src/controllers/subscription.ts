import { Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { PaymentMethod } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

const MONTHLY_SUBSCRIPTION_PRICE = 29.99;

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentMethod, cryptoTxId } = req.body;

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId!,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      }
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'Active subscription already exists' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    let stripeSubId: string | undefined;

    if (paymentMethod === 'CARD') {
      const stripeSubscription = await stripe.subscriptions.create({
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Content Subscription'
              },
              recurring: {
                interval: 'month'
              },
              unit_amount: Math.round(MONTHLY_SUBSCRIPTION_PRICE * 100)
            }
          }
        ],
        metadata: {
          userId: req.userId!
        }
      });
      stripeSubId = stripeSubscription.id;
    } else if (paymentMethod === 'CRYPTO') {
      if (!cryptoTxId) {
        return res.status(400).json({ error: 'Crypto transaction ID required' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.userId!,
        status: 'ACTIVE',
        startDate,
        endDate,
        monthlyPrice: MONTHLY_SUBSCRIPTION_PRICE,
        paymentMethod: paymentMethod as PaymentMethod,
        stripeSubId
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (subscription.stripeSubId) {
      await stripe.subscriptions.cancel(subscription.stripeSubId);
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json(updated);
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
