const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Associated campaign ID is required']
    },
    source: {
      type: String,
      trim: true,
      default: 'Reel'
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        message: '{VALUE} is not a valid lead status'
      },
      default: 'new'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt
  }
);

module.exports = mongoose.model('Lead', leadSchema);
