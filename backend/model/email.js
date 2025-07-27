import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    subject: String,
    body: String,
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    image: String,
    name: {
      type: String,
      required: true,
    },
    starred: {
      type: Boolean,
      required: true,
      default: false,
    },
    bin: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Email', EmailSchema);
