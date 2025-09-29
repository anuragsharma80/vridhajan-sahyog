const Member = require('../models/memberModel');
const Receipt = require('../models/receiptModel');

// @desc    Create a new member
// @route   POST /api/members
// @access  Private
const createMember = async (req, res) => {
  try {
    const memberData = req.body;

    // Check if daniMemberNo already exists
    if (memberData.daniMemberNo) {
      const existingMember = await Member.findOne({ daniMemberNo: memberData.daniMemberNo });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Dani Member Number already exists'
        });
      }
    }

    // Auto-generate registration number
    const lastMember = await Member.findOne({ isActive: true })
      .sort({ regNo: -1 })
      .select('regNo');

    let nextRegNo = 1;
    
    if (lastMember) {
      // Start from the highest number + 1 and find the next available
      nextRegNo = lastMember.regNo + 1;
      
      // Check if this number is already taken, if so, find the next available
      let isAvailable = false;
      while (!isAvailable) {
        const existingMember = await Member.findOne({ 
          regNo: nextRegNo, 
          isActive: true 
        });
        
        if (!existingMember) {
          isAvailable = true;
        } else {
          nextRegNo++;
        }
      }
    }
    
    // Remove regNo from frontend data and set the auto-generated one
    delete memberData.regNo;
    memberData.regNo = nextRegNo;

    // Create new member
    const member = await Member.create(memberData);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Create member error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all members with pagination
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const members = await Member.find({ isActive: true })
      .select('universalKey regNo daniMemberNo memberName fatherHusbandName contact.mob1 contact.emailId address.city address.state personal.occupation registrationDate')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Member.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMembers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search members
// @route   GET /api/members/search
// @access  Private
const searchMembers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(query.trim(), 'i');

    // Search in multiple fields
    const searchQuery = {
      isActive: true,
      $or: [
        { memberName: searchRegex },
        { regNo: isNaN(query) ? null : parseInt(query) },
        { 'contact.mob1': searchRegex },
        { 'contact.emailId': searchRegex },
        { 'identification.panNo': searchRegex.toUpperCase() }
      ].filter(condition => condition.regNo !== null || !isNaN(query))
    };

    const members = await Member.find(searchQuery)
      .select('universalKey regNo daniMemberNo memberName fatherHusbandName contact.mob1 contact.emailId address.city address.state personal.occupation registrationDate')
      .sort({ memberName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Member.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMembers: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get member by universal key
// @route   GET /api/members/:universalKey
// @access  Private
const getMemberByKey = async (req, res) => {
  try {
    const { universalKey } = req.params;

    const member = await Member.findOne({ 
      universalKey, 
      isActive: true 
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get all receipts for this member
    const receipts = await Receipt.find({ 
      member: member._id, 
      isActive: true 
    })
    .sort({ receiptDate: -1 })
    .select('receiptNo amount receiptDate paymentMode remarks');

    // Calculate total donations
    const totalDonations = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

    res.json({
      success: true,
      data: {
        member,
        receipts,
        summary: {
          totalReceipts: receipts.length,
          totalDonations,
          lastDonationDate: receipts.length > 0 ? receipts[0].receiptDate : null
        }
      }
    });
  } catch (error) {
    console.error('Get member by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update member
// @route   PUT /api/members/:universalKey
// @access  Private
const updateMember = async (req, res) => {
  try {
    const { universalKey } = req.params;
    const updateData = req.body;

    // Check if regNo is being updated and if it already exists
    if (updateData.regNo) {
      const existingMember = await Member.findOne({ 
        regNo: updateData.regNo, 
        universalKey: { $ne: universalKey } 
      });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Registration number already exists'
        });
      }
    }

    const member = await Member.findOneAndUpdate(
      { universalKey, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Update member error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete member (soft delete)
// @route   DELETE /api/members/:universalKey
// @access  Private
const deleteMember = async (req, res) => {
  try {
    const { universalKey } = req.params;

    const member = await Member.findOneAndUpdate(
      { universalKey, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get next registration number
// @route   GET /api/members/next-reg-no
// @access  Private
const getNextRegNo = async (req, res) => {
  try {
    // Find the highest registration number
    const lastMember = await Member.findOne({ isActive: true })
      .sort({ regNo: -1 })
      .select('regNo');

    let nextRegNo = 1;
    
    if (lastMember) {
      // Start from the highest number + 1 and find the next available
      nextRegNo = lastMember.regNo + 1;
      
      // Check if this number is already taken, if so, find the next available
      let isAvailable = false;
      while (!isAvailable) {
        const existingMember = await Member.findOne({ 
          regNo: nextRegNo, 
          isActive: true 
        });
        
        if (!existingMember) {
          isAvailable = true;
        } else {
          nextRegNo++;
        }
      }
    }

    res.json({
      success: true,
      data: { nextRegNo }
    });
  } catch (error) {
    console.error('Get next reg no error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get member by Dani Member Number
// @route   GET /api/members/dani/:daniMemberNo
// @access  Private
const getMemberByDaniNumber = async (req, res) => {
  try {
    const { daniMemberNo } = req.params;

    const member = await Member.findOne({ daniMemberNo });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Get member by Dani number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update member by Dani Member Number
// @route   PUT /api/members/dani/:daniMemberNo
// @access  Private
const updateMemberByDaniNumber = async (req, res) => {
  try {
    const { daniMemberNo } = req.params;
    const updateData = req.body;

    // Check if member exists
    const existingMember = await Member.findOne({ daniMemberNo });
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Update member
    const updatedMember = await Member.findOneAndUpdate(
      { daniMemberNo },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member by Dani number error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createMember,
  getMembers,
  searchMembers,
  getMemberByKey,
  updateMember,
  deleteMember,
  getNextRegNo,
  getMemberByDaniNumber,
  updateMemberByDaniNumber
};
