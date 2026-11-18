const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns (with optional status/platform filter and search)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, platform, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (platform) {
      filter.platform = platform;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get single campaign by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid campaign ID format: '${id}'`
      });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, platform, reelUrl, targetAudience, budget, status, startDate, endDate } = req.body;

    // Validate essential required fields upfront for clear feedback
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Campaign title is required'
      });
    }

    const newCampaign = await Campaign.create({
      title: title.trim(),
      description,
      platform,
      reelUrl,
      targetAudience,
      budget,
      status,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update an existing campaign by ID
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid campaign ID format: '${id}'`
      });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: 'after', // Return the modified document (Mongoose 9+)
        runValidators: true // Run schema validations on update
      }
    );

    if (!updatedCampaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: updatedCampaign
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete a campaign and cascade delete its associated leads
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid campaign ID format: '${id}'`
      });
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${id}`
      });
    }

    // Clean up associated leads so we don't leave orphaned records
    const deleteLeadsResult = await Lead.deleteMany({ campaignId: id });

    res.status(200).json({
      success: true,
      message: 'Campaign and associated leads deleted successfully',
      deletedLeadsCount: deleteLeadsResult.deletedCount,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/campaigns/:id/leads
 * @desc    Get all leads associated with a specific campaign
 * @access  Public
 */
router.get('/:id/leads', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid campaign ID format: '${id}'`
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${id}`
      });
    }

    const leads = await Lead.find({ campaignId: id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      campaignTitle: campaign.title,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
