import express, { Request, Response, NextFunction } from 'express';
import { AuctionModel } from '../models/Auction';
import { NFTModel } from '../models/NFT';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validateAuction } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const auctions = await AuctionModel.find().populate('nft').populate('winner');
  res.json(auctions);
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const auction = await AuctionModel.findById(req.params.id).populate('nft').populate('winner');
  if (!auction) {
    res.status(404).json({ error: 'Auction not found' });
  } else {
    res.json(auction);
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  const nft = await NFTModel.findById(req.body.nftId);
  if (!nft) {
    res.status(404).json({ error: 'NFT not found' });
  } else {
    const auction = new AuctionModel({
      nft: nft._id,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      startingPrice: req.body.startingPrice,
      reservePrice: req.body.reservePrice,
    });
    await auction.save();
    res.json(auction);
  }
});

router.post('/:id/bid', authenticate, async (req: Request, res: Response) => {
  const auction = await AuctionModel.findById(req.params.id);
  if (!auction) {
    res.status(404).json({ error: 'Auction not found' });
  } else {
    const user = await UserModel.findById(req.user._id);
    if (auction.endTime < Date.now()) {
      res.status(403).json({ error: 'Auction has ended' });
    } else {
      const bid = req.body.bid;
      if (bid < auction.startingPrice) {
        res.status(400).json({ error: 'Bid is too low' });
      } else {
        auction.bids.push({ user: req.user._id, amount: bid });
        await auction.save();
        res.json({ message: 'Bid placed successfully' });
      }
    }
  }
});

router.get('/:id/winner', authenticate, async (req: Request, res: Response) => {
  const auction = await AuctionModel.findById(req.params.id);
  if (!auction) {
    res.status(404).json({ error: 'Auction not found' });
  } else {
    if (auction.endTime < Date.now()) {
      const winner = await getWinner(auction);
      res.json(winner);
    } else {
      res.status(403).json({ error: 'Auction has not ended' });
    }
  }
});

async function getWinner(auction: AuctionModel) {
  const bids = auction.bids;
  let winner;
  let highestBid = 0;
  for (const bid of bids) {
    if (bid.amount > highestBid) {
      highestBid = bid.amount;
      winner = bid.user;
    }
  }
  return winner;
}

export default router;
       
