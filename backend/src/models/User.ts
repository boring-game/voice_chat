import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  friends: mongoose.Types.ObjectId[];
  devices: {
    deviceId: string;
    name: string;
    lastActive: Date;
  }[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'default-avatar.png' },
  status: { type: String, enum: ['online', 'offline', 'away', 'busy'], default: 'offline' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  devices: [{
    deviceId: { type: String, required: true },
    name: { type: String, required: true },
    lastActive: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);

