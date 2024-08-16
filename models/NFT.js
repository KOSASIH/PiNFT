import { model, Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';
import { createHmac } from 'crypto';
import { IPFS } from 'ipfs-http-client';
import { NFTStorage } from 'nft.storage';

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });

interface INFT {
  _id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  blockchain: string;
  tokenStandard: string;
  tokenID: string;
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NFTSchema = new Schema<INFT>({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  blockchain: {
    type: String,
    required: true,
  },
  tokenStandard: {
    type: String,
    required: true,
  },
  tokenID: {
    type: String,
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

NFTSchema.pre('save', async function(next) {
  const nft = this;
  if (nft.isNew) {
    const imageBuffer = await ipfs.add(nft.image);
    nft.image = `ipfs://${imageBuffer.path}`;
    const metadata = await nftStorage.storeMetadata(nft);
    nft.metadata = metadata;
  }
  next();
});

NFTSchema.methods.generateToken = async function() {
  const nft = this;
  const token = sign({ nftID: nft._id }, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
  return token;
};

NFTSchema.methods.verifyOwnership = async function(ownerAddress: string) {
  const nft = this;
  const owner = await User.findOne({ address: ownerAddress });
  if (!owner) {
    throw new Error('Invalid owner address');
  }
  const hmac = createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(`${nft._id}${ownerAddress}`);
  const signature = hmac.digest('hex');
  return signature === nft.owner;
};

const NFTModel = model<INFT>('NFT', NFTSchema);

export default NFTModel;
