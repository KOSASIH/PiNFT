import express, { Request, Response, NextFunction } from 'express';
import { NFTModel } from '../models/NFT';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { validateNFT } from '../middleware/validation';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const nfts = await NFTModel.find().populate('owner');
  res.json(nfts);
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.params.id).populate('owner');
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    res.json(nft);
  }
});

router.post('/', authenticate, uploadImage, validateNFT, async (req: Request, res: Response) => {
  const nft = new NFTModel({
    name: req.body.name,
    description: req.body.description,
    image: req.file.buffer,
    owner: req.user._id,
  });
  await nft.save();
  res.json(nft);
});

router.put('/:id', authenticate, uploadImage, validateNFT, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.params.id);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    nft.name = req.body.name;
    nft.description = req.body.description;
    nft.image = req.file.buffer;
    await nft.save();
    res.json(nft);
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findByIdAndRemove(req.params.id);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    res.json({ message: 'NFT deleted successfully' });
  }
});

router.post('/:id/transfer', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.params.id);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    const hmac = createHmac('sha256', process.env.SECRET_KEY);
    hmac.update(`${nft._id}${req.user._id}`);
    const signature = hmac.digest('hex');
    if (signature !== nft.owner) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      nft.owner = req.body.newOwner;
      await nft.save();
      res.json({ message: 'NFT transferred successfully' });
    }
  }
});

export default router;
