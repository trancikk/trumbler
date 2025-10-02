import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { ContentType } from '@prisma/client';

export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, price, categoryIds, tagIds } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.fullFile || !files.fullFile[0]) {
      return res.status(400).json({ error: 'Full content file is required' });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.userId! }
    });

    if (!creatorProfile) {
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    const content = await prisma.content.create({
      data: {
        title,
        description,
        type: type as ContentType,
        fullFilePath: files.fullFile[0].path,
        previewFilePath: files.previewFile?.[0]?.path,
        price: parseFloat(price),
        creatorId: creatorProfile.id,
        categories: categoryIds
          ? { connect: JSON.parse(categoryIds).map((id: string) => ({ id })) }
          : undefined,
        tags: tagIds
          ? { connect: JSON.parse(tagIds).map((id: string) => ({ id })) }
          : undefined
      },
      include: {
        creator: true,
        categories: true,
        tags: true
      }
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Content creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContent = async (req: AuthRequest, res: Response) => {
  try {
    const { category, tag, search } = req.query;

    const content = await prisma.content.findMany({
      where: {
        AND: [
          category ? { categories: { some: { name: category as string } } } : {},
          tag ? { tags: { some: { name: tag as string } } } : {},
          search
            ? {
                OR: [
                  { title: { contains: search as string, mode: 'insensitive' } },
                  { description: { contains: search as string, mode: 'insensitive' } }
                ]
              }
            : {}
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        categories: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const contentWithAccess = content.map(item => ({
      ...item,
      fullFilePath: req.userId ? item.fullFilePath : undefined,
      previewFilePath: item.previewFilePath
    }));

    res.json(contentWithAccess);
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        categories: true,
        tags: true
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    let hasAccess = false;
    if (req.userId) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_contentId: {
            userId: req.userId,
            contentId: id
          }
        }
      });

      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId: req.userId,
          status: 'ACTIVE',
          endDate: { gte: new Date() }
        }
      });

      hasAccess = !!purchase || !!activeSubscription;
    }

    res.json({
      ...content,
      fullFilePath: hasAccess ? content.fullFilePath : undefined,
      previewFilePath: content.previewFilePath
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryIds, tagIds } = req.body;

    const content = await prisma.content.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.creator.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.content.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        categories: categoryIds
          ? { set: [], connect: JSON.parse(categoryIds).map((id: string) => ({ id })) }
          : undefined,
        tags: tagIds
          ? { set: [], connect: JSON.parse(tagIds).map((id: string) => ({ id })) }
          : undefined
      },
      include: {
        creator: true,
        categories: true,
        tags: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Content update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.creator.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.content.delete({ where: { id } });

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Content deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
