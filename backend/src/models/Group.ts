import mongoose from 'mongoose';

interface IGroup extends mongoose.Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  inviteCodes: {
    code: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCodes: [{
    code: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IGroup>('Group', groupSchema);

