import express, { Request, Response, NextFunction } from 'express';
import { NFTModel } from '../models/NFT';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validateMarketplace } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const nfts = await NFTModel.find().populate('owner');
  res.json(nfts);
});

router.get('/featured', authenticate, async (req: Request, res: Response) => {
  const nfts = await NFTModel.find({ featured: true }).populate('owner');
  res.json(nfts);
});

router.get('/search', authenticate, async (req: Request, res: Response) => {
  const query = req.query.q;
  const nfts = await NFTModel.find({ $text: { $search: query } }).populate('owner');
  res.json(nfts);
});

router.post('/buy', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.body.nftId);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    const user = await UserModel.findById(req.user._id);
    if (user.balance < nft.price) {
      res.status(402).json({ error: 'Insufficient balance' });
    } else {
      user.balance -= nft.price;
      nft.owner = req.user._id;
      await user.save();
      await nft.save();
      res.json({ message: 'NFT purchased successfully' });
    }
  }
});

router.post('/sell', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.body.nftId);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    const user = await UserModel.findById(req.user._id);
    if (nft.owner !== req.user._id) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      nft.price = req.body.price;
      await nft.save();
      res.json({ message: 'NFT listed for sale successfully' });
    }
  }
});

router.post('/cancel', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.body.nftId);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    const user = await UserModel.findById(req.user._id);
    if (nft.owner !== req.user._id) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      nft.price = 0;
      await nft.save();
      res.json({ message: 'NFT listing cancelled successfully' });
    }
  }
});

export default router;
