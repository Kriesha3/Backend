const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: [3, 'Campaign title must be at least 3 characters long'],
      maxlength: [100, 'Campaign title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'LinkedIn', 'Other'],
        message: '{VALUE} is not a supported platform'
      },
      default: 'Instagram'
    },
    reelUrl: {
      type: String,
      trim: true
    },
    targetAudience: {
      type: String,
      trim: true
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'paused', 'completed'],
        message: '{VALUE} is not a valid campaign status'
      },
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt
  }
);

module.exports = mongoose.model('Campaign', campaignSchema);
