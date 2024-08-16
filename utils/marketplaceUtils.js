import { AuctionModel } from '../models/Auction';
import { NFTModel } from '../models/NFT';
import { UserModel } from '../models/User';
import { BlockchainService } from '../services/BlockchainService';
import { config } from '../config';

const blockchainService = new BlockchainService();

export async function createAuction(auctionData: any) {
  const auction = new AuctionModel(auctionData);
  await auction.save();
  return auction;
}

export async function getAuction(auctionId: string) {
  const auction = await AuctionModel.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  return auction;
}

export async function updateAuction(auctionId: string, updates: any) {
  const auction = await AuctionModel.findByIdAndUpdate(auctionId, updates, { new: true });
  if (!auction) {
    throw new Error('Auction not found');
  }
  return auction;
}

export async function deleteAuction(auctionId: string) {
  const auction = await AuctionModel.findByIdAndRemove(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  return auction;
}

export async function placeBid(auctionId: string, userId: string, bidAmount: number) {
  const auction = await AuctionModel.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (auction.endTime < Date.now()) {
    throw new Error('Auction has ended');
  }
  if (bidAmount < auction.startingPrice) {
    throw new Error('Bid is too low');
  }
  auction.bids.push({ user: user._id, amount: bidAmount });
  await auction.save();
  return auction;
}

export async function getAuctionsByUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const auctions = await AuctionModel.find({ creator: user._id });
  return auctions;
}

export async function getAuctionsByNFT(nftId: string) {
  const nft = await NFTModel.findById(nftId);
  if (!nft) {
    throw new Error('NFT not found');
  }
  const auctions = await AuctionModel.find({ nfts: nft._id });
  return auctions;
}

export async function getAuctionWinner(auctionId: string) {
  const auction = await AuctionModel.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  if (auction.endTime < Date.now()) {
    const winner = await getHighestBidder(auction);
    return winner;
  } else {
    throw new Error('Auction has not ended');
  }
}

async function getHighestBidder(auction: AuctionModel) {
  let highestBid = 0;
  let winner;
  for (const bid of auction.bids) {
    if (bid.amount > highestBid) {
      highestBid = bid.amount;
      winner = bid.user;
    }
  }
  return winner;
}

export async function settleAuction(auctionId: string) {
  const auction = await AuctionModel.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  if (auction.endTime < Date.now()) {
    const winner = await getHighestBidder(auction);
    const nft = await NFTModel.findById(auction.nfts[0]);
    await transferNFT(nft._id, winner);
    await blockchainService.transferETH(auction.creator, winner, highestBid);
    auction.status = 'settled';
    await auction.save();
    return auction;
  } else {
    throw new Error('Auction has not ended');
  }
}
