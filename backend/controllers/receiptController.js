const Receipt = require('../models/receiptModel');
const Member = require('../models/memberModel');

// @desc    Create a new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
  try {
    console.log('Creating receipt with data:', req.body);
    
    const receiptData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Verify member exists
    const member = await Member.findOne({ 
      universalKey: receiptData.member, 
      isActive: true 
    });
    
    if (!member) {
      console.log('Member not found:', receiptData.member);
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Set member reference
    receiptData.member = member._id;

    // Check if receipt number already exists
    if (receiptData.receiptNo) {
      const existingReceipt = await Receipt.findOne({ receiptNo: receiptData.receiptNo });
      if (existingReceipt) {
        console.log('Receipt number already exists:', receiptData.receiptNo);
        return res.status(400).json({
          success: false,
          message: 'Receipt number already exists'
        });
      }
    }

    console.log('Creating receipt with processed data:', receiptData);
    const receipt = await Receipt.create(receiptData);
    console.log('Receipt created successfully:', receipt._id);
    
    // Populate member details
    await receipt.populate('member', 'universalKey regNo memberName contact.mob1');

    res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      data: { receipt }
    });
  } catch (error) {
    console.error('Create receipt error:', error);
    console.error('Error stack:', error.stack);
    
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

// @desc    Get all receipts with pagination
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const receipts = await Receipt.find({ isActive: true })
      .populate('member', 'universalKey regNo memberName contact.mob1')
      .sort({ receiptDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Receipt.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        receipts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReceipts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('member', 'universalKey regNo memberName contact.mob1 address')
      .populate('createdBy', 'username');

    if (!receipt || !receipt.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      data: { receipt }
    });
  } catch (error) {
    console.error('Get receipt by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
  try {
    const updateData = req.body;

    // If member universalKey is provided, find the member
    if (updateData.member && typeof updateData.member === 'string') {
      const member = await Member.findOne({ 
        universalKey: updateData.member, 
        isActive: true 
      });
      
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
      
      updateData.member = member._id;
    }

    // Check if receipt number is being updated and if it already exists
    if (updateData.receiptNo) {
      const existingReceipt = await Receipt.findOne({ 
        receiptNo: updateData.receiptNo, 
        _id: { $ne: req.params.id } 
      });
      if (existingReceipt) {
        return res.status(400).json({
          success: false,
          message: 'Receipt number already exists'
        });
      }
    }

    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('member', 'universalKey regNo memberName contact.mob1');

    if (!receipt || !receipt.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt updated successfully',
      data: { receipt }
    });
  } catch (error) {
    console.error('Update receipt error:', error);
    
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

// @desc    Delete receipt (soft delete)
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get receipts by member
// @route   GET /api/receipts/member/:universalKey
// @access  Private
const getReceiptsByMember = async (req, res) => {
  try {
    const { universalKey } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find member
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

    // Get receipts for this member
    const receipts = await Receipt.find({ 
      member: member._id, 
      isActive: true 
    })
    .populate('member', 'universalKey regNo memberName contact.mob1')
    .sort({ receiptDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Receipt.countDocuments({ 
      member: member._id, 
      isActive: true 
    });

    // Calculate total donations
    const totalDonations = await Receipt.aggregate([
      { $match: { member: member._id, isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        member: {
          universalKey: member.universalKey,
          regNo: member.regNo,
          memberName: member.memberName
        },
        receipts,
        summary: {
          totalReceipts: total,
          totalDonations: totalDonations.length > 0 ? totalDonations[0].total : 0
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get receipts by member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get member by Dani Member Number for receipt entry
// @route   GET /api/receipts/member/dani/:daniMemberNo
// @access  Private
const getMemberByDaniForReceipt = async (req, res) => {
  try {
    const { daniMemberNo } = req.params;

    const member = await Member.findOne({ 
      daniMemberNo,
      isActive: true 
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found. Please register the member first.'
      });
    }

    res.json({
      success: true,
      data: {
        member: {
          universalKey: member.universalKey,
          regNo: member.regNo,
          daniMemberNo: member.daniMemberNo,
          memberName: member.memberName,
          fatherHusbandName: member.fatherHusbandName,
          contact: {
            mob1: member.contact?.mob1 || '',
            mobNo2: member.contact?.mobNo2 || '',
            emailId: member.contact?.emailId || ''
          },
          personal: {
            dateOfBirth: member.personal?.dateOfBirth || '',
            occupation: member.personal?.occupation || ''
          },
          membership: {
            cardClass: member.membership?.cardClass || '',
            validity: member.membership?.validity || ''
          },
          registrationDate: member.registrationDate
        }
      }
    });
  } catch (error) {
    console.error('Get member by Dani number for receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get next receipt number for a book
// @route   GET /api/receipts/next-receipt/:bookNo
// @access  Private
const getNextReceiptNumber = async (req, res) => {
  try {
    const { bookNo } = req.params;
    const bookNumber = parseInt(bookNo);

    if (!bookNumber || bookNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book number'
      });
    }

    // Find the last receipt number for this book
    const lastReceipt = await Receipt.findOne({ 
      bookNo: bookNumber,
      isActive: true 
    }).sort({ receiptNo: -1 });
    
    let nextReceiptNo;
    if (lastReceipt && lastReceipt.receiptNo) {
      const lastNumber = parseInt(lastReceipt.receiptNo);
      nextReceiptNo = lastNumber + 1;
    } else {
      // First receipt for this book
      nextReceiptNo = (bookNumber - 1) * 25 + 1;
    }

    // Check if we've exceeded the book's range
    const bookStart = (bookNumber - 1) * 25 + 1;
    const bookEnd = bookNumber * 25;
    
    if (nextReceiptNo > bookEnd) {
      return res.status(400).json({
        success: false,
        message: `Book ${bookNumber} is full. Valid range is ${bookStart}-${bookEnd}`
      });
    }

    res.json({
      success: true,
      data: {
        bookNo: bookNumber,
        nextReceiptNo: nextReceiptNo.toString(),
        validRange: {
          start: bookStart,
          end: bookEnd
        }
      }
    });
  } catch (error) {
    console.error('Get next receipt number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check if receipt combination exists
// @route   GET /api/receipts/check-duplicate/:bookNo/:receiptNo
// @access  Private
const checkReceiptDuplicate = async (req, res) => {
  try {
    const { bookNo, receiptNo } = req.params;
    const bookNumber = parseInt(bookNo);
    const receiptNumber = parseInt(receiptNo);

    if (!bookNumber || bookNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book number'
      });
    }

    if (!receiptNumber || receiptNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receipt number'
      });
    }

    // Check if receipt combination already exists
    const existingReceipt = await Receipt.findOne({ 
      bookNo: bookNumber,
      receiptNo: receiptNumber.toString(),
      isActive: true 
    });

    // Validate receipt number is within correct range for the book
    const bookStart = (bookNumber - 1) * 25 + 1;
    const bookEnd = bookNumber * 25;
    
    if (receiptNumber < bookStart || receiptNumber > bookEnd) {
      return res.json({
        success: true,
        data: {
          exists: false,
          valid: false,
          message: `Receipt number ${receiptNumber} is not within the valid range for Book ${bookNumber} (${bookStart}-${bookEnd})`
        }
      });
    }

    res.json({
      success: true,
      data: {
        exists: !!existingReceipt,
        valid: true,
        message: existingReceipt ? 'This receipt combination already exists' : 'Receipt combination is available'
      }
    });
  } catch (error) {
    console.error('Check receipt duplicate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check if a receipt book is full (25 receipts)
// @route   GET /api/receipts/book-count/:bookNo
// @access  Private
const checkBookCount = async (req, res) => {
  try {
    const { bookNo } = req.params;
    const bookNumber = parseInt(bookNo);

    if (!bookNumber || bookNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book number'
      });
    }

    // Count receipts for this book
    const count = await Receipt.countDocuments({ 
      bookNo: bookNumber,
      isActive: true 
    });

    const isFull = count >= 25;

    res.json({
      success: true,
      data: {
        bookNo: bookNumber,
        count: count,
        isFull: isFull,
        message: isFull ? `Book ${bookNumber} is full (${count}/25 receipts)` : `Book ${bookNumber} has ${count}/25 receipts`
      }
    });
  } catch (error) {
    console.error('Check book count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  getReceiptsByMember,
  getMemberByDaniForReceipt,
  getNextReceiptNumber,
  checkReceiptDuplicate,
  checkBookCount
};
