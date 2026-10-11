// src/models/Download.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDownload extends Document {
  token: string;
  orderId: string;
  productId: number;
  fileName: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: Date;
  createdAt: Date;
}

const downloadSchema = new Schema<IDownload>({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  orderId: { 
    type: String, 
    required: true 
  },
  productId: { 
    type: Number, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  maxDownloads: { 
    type: Number, 
    default: 5 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IDownload>('Download', downloadSchema);