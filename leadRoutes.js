const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route   GET /api/leads
 * @desc    Get all leads (with optional campaignId and status filtering)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { campaignId, status, search } = req.query;
    const filter = {};

    if (campaignId) {
      if (!isValidObjectId(campaignId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid campaignId query filter: '${campaignId}'`
        });
      }
      filter.campaignId = campaignId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('campaignId', 'title platform status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leads/:id
 * @desc    Get single lead by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lead ID format: '${id}'`
      });
    }

    const lead = await Lead.findById(id).populate('campaignId', 'title platform status reelUrl');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/leads
 * @desc    Create a new lead (e.g. captured from a reel)
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, campaignId, source, status, notes } = req.body;

    // Upfront input validation for clear beginner feedback
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Lead name is required'
      });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Lead email is required'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Associated campaignId is required'
      });
    }

    if (!isValidObjectId(campaignId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid campaignId format: '${campaignId}'`
      });
    }

    // Verify the referenced campaign actually exists
    const campaignExists = await Campaign.findById(campaignId);
    if (!campaignExists) {
      return res.status(404).json({
        success: false,
        message: `Referenced campaign not found with ID: ${campaignId}`
      });
    }

    const newLead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      campaignId,
      source: source || 'Reel',
      status: status || 'new',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      data: newLead
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead information / status
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lead ID format: '${id}'`
      });
    }

    // If campaignId is included in update payload, ensure it's valid and exists
    if (req.body.campaignId) {
      if (!isValidObjectId(req.body.campaignId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid campaignId format: '${req.body.campaignId}'`
        });
      }

      const campaignExists = await Campaign.findById(req.body.campaignId);
      if (!campaignExists) {
        return res.status(404).json({
          success: false,
          message: `Referenced campaign not found with ID: ${req.body.campaignId}`
        });
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: 'after', // Return modified document (Mongoose 9+)
        runValidators: true
      }
    ).populate('campaignId', 'title platform status');

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead by ID
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lead ID format: '${id}'`
      });
    }

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
