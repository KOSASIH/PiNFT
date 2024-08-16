import { model, Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';

interface IUser {
  _id: string;
  address: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: {
    type: String,
    default: uuidv4,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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

UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isNew) {
    const salt = await promisify(hash)(user.password, 10);
    user.password = salt;
  }
  next();
});

UserSchema.methods.generateToken = async function() {
  const user = this;
  const token = sign({ userID: user._id }, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
  return token;
};

UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  const user = this;
  const isMatch = await promisify(hash)(candidatePassword, user.password);
  return isMatch;
};

const UserModel = model<IUser>('User', UserSchema);

export default UserModel;
