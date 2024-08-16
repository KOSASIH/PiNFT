import { NFTModel } from '../models/NFT';
import { UserModel } from '../models/User';
import { AuctionModel } from '../models/Auction';
import { BlockchainService } from '../services/BlockchainService';
import { IPFS } from '../services/IPFS';
import { config } from '../config';

const blockchainService = new BlockchainService();
const ipfs = new IPFS();

export async function createNFT(nftData: any) {
  const nft = new NFTModel(nftData);
  await nft.save();
  return nft;
}

export async function getNFT(nftId: string) {
  const nft = await NFTModel.findById(nftId);
  if (!nft) {
    throw new Error('NFT not found');
  }
  return nft;
}

export async function updateNFT(nftId: string, updates: any) {
  const nft = await NFTModel.findByIdAndUpdate(nftId, updates, { new: true });
  if (!nft) {
    throw new Error('NFT not found');
  }
  return nft;
}

export async function deleteNFT(nftId: string) {
  const nft = await NFTModel.findByIdAndRemove(nftId);
  if (!nft) {
    throw new Error('NFT not found');
  }
  return nft;
}

export async function mintNFT(nftData: any, userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const nft = new NFTModel(nftData);
  nft.owner = user._id;
  await nft.save();
  const tokenUri = await ipfs.uploadMetadata(nft);
  const tokenId = await blockchainService.mintNFT(user.walletAddress, tokenUri);
  nft.tokenId = tokenId;
  await nft.save();
  return nft;
}

export async function transferNFT(nftId: string, toUserId: string) {
  const nft = await NFTModel.findById(nftId);
  if (!nft) {
    throw new Error('NFT not found');
  }
  const toUser = await UserModel.findById(toUserId);
  if (!toUser) {
    throw new Error('User not found');
  }
  nft.owner = toUser._id;
  await nft.save();
  await blockchainService.transferNFT(nft.tokenId, toUser.walletAddress);
  return nft;
}

export async function getNFTsByUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const nfts = await NFTModel.find({ owner: user._id });
  return nfts;
}

export async function getNFTsByAuction(auctionId: string) {
  const auction = await AuctionModel.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }
  const nfts = await NFTModel.find({ _id: { $in: auction.nfts } });
  return nfts;
}
