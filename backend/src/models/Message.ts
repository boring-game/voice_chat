import mongoose from 'mongoose';

interface IMessage extends mongoose.Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  isDelivered: boolean;
  isRead: boolean;
  isRevoked: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isDelivered: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  isRevoked: { type: Boolean, default: false },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number }
});

messageSchema.index({ sender: 1, receiver: 1, group: 1, timestamp: -1 });
messageSchema.index({ content: 'text' });

export default mongoose.model<IMessage>('Message', messageSchema);

