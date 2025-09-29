const Receipt = require('../models/receiptModel');
const Member = require('../models/memberModel');

// @desc    Get top donors with filtering
// @route   GET /api/donors/top
// @access  Private
const getTopDonors = async (req, res) => {
  try {
    const { year, month, fromDate, toDate, limit = 50 } = req.query;
    
    // Build date filter
    let dateFilter = {};
    
    // Priority: fromDate/toDate > year/month (for backward compatibility)
    if (fromDate && toDate) {
      // Date range filter (new Reports page functionality)
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      // Set end date to end of day to include the entire day
      endDate.setHours(23, 59, 59, 999);
      
      dateFilter = {
        receiptDate: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else if (year) {
      const startYear = new Date(parseInt(year), 0, 1);
      const endYear = new Date(parseInt(year) + 1, 0, 1);
      
      if (month) {
        // Monthly filter
        const startMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endMonth = new Date(parseInt(year), parseInt(month), 1);
        dateFilter = {
          receiptDate: {
            $gte: startMonth,
            $lt: endMonth
          }
        };
      } else {
        // Yearly filter
        dateFilter = {
          receiptDate: {
            $gte: startYear,
            $lt: endYear
          }
        };
      }
    }

    // Aggregation pipeline to get top donors
    const pipeline = [
      // Match active receipts with date filter
      {
        $match: {
          isActive: true,
          ...dateFilter
        }
      },
      // Group by member and calculate totals
      {
        $group: {
          _id: '$member',
          totalAmount: { $sum: '$amount' },
          receiptCount: { $sum: 1 },
          lastDonationDate: { $max: '$receiptDate' },
          firstDonationDate: { $min: '$receiptDate' }
        }
      },
      // Sort by total amount descending
      {
        $sort: { totalAmount: -1 }
      },
      // Limit results
      {
        $limit: parseInt(limit)
      },
      // Lookup member details
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Unwind member details
      {
        $unwind: '$memberDetails'
      },
      // Match only active members
      {
        $match: {
          'memberDetails.isActive': true
        }
      },
      // Project final structure
      {
        $project: {
          _id: 0,
          memberId: '$_id',
          universalKey: '$memberDetails.universalKey',
          regNo: '$memberDetails.regNo',
          memberName: '$memberDetails.memberName',
          city: '$memberDetails.address.city',
          state: '$memberDetails.address.state',
          totalAmount: 1,
          receiptCount: 1,
          lastDonationDate: 1,
          firstDonationDate: 1
        }
      }
    ];

    const topDonors = await Receipt.aggregate(pipeline);

    // Calculate summary statistics
    const summaryPipeline = [
      {
        $match: {
          isActive: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: '$amount' },
          totalReceipts: { $sum: 1 },
          uniqueDonors: { $addToSet: '$member' }
        }
      },
      {
        $project: {
          _id: 0,
          totalDonations: 1,
          totalReceipts: 1,
          uniqueDonorCount: { $size: '$uniqueDonors' }
        }
      }
    ];

    const summary = await Receipt.aggregate(summaryPipeline);
    const summaryData = summary.length > 0 ? summary[0] : {
      totalDonations: 0,
      totalReceipts: 0,
      uniqueDonorCount: 0
    };

    res.json({
      success: true,
      data: {
        topDonors,
        summary: summaryData,
        filters: {
          year: year ? parseInt(year) : null,
          month: month ? parseInt(month) : null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get top donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get donation statistics
// @route   GET /api/donors/stats
// @access  Private
const getDonationStats = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (year) {
      const startYear = new Date(parseInt(year), 0, 1);
      const endYear = new Date(parseInt(year) + 1, 0, 1);
      dateFilter = {
        receiptDate: {
          $gte: startYear,
          $lt: endYear
        }
      };
    }

    // Monthly statistics
    const monthlyStats = await Receipt.aggregate([
      {
        $match: {
          isActive: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$receiptDate' },
            month: { $month: '$receiptDate' }
          },
          totalAmount: { $sum: '$amount' },
          receiptCount: { $sum: 1 },
          uniqueDonors: { $addToSet: '$member' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          receiptCount: 1,
          uniqueDonorCount: { $size: '$uniqueDonors' }
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Payment mode statistics
    const paymentModeStats = await Receipt.aggregate([
      {
        $match: {
          isActive: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$amount' },
          receiptCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          paymentMode: '$_id',
          totalAmount: 1,
          receiptCount: 1
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        monthlyStats,
        paymentModeStats,
        filter: {
          year: year ? parseInt(year) : null
        }
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get donor details with donation history
// @route   GET /api/donors/:universalKey
// @access  Private
const getDonorDetails = async (req, res) => {
  try {
    const { universalKey } = req.params;
    const { year, month } = req.query;

    // Find member
    const member = await Member.findOne({ 
      universalKey, 
      isActive: true 
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Build date filter for receipts
    let dateFilter = {};
    if (year) {
      const startYear = new Date(parseInt(year), 0, 1);
      const endYear = new Date(parseInt(year) + 1, 0, 1);
      
      if (month) {
        const startMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endMonth = new Date(parseInt(year), parseInt(month), 1);
        dateFilter = {
          receiptDate: {
            $gte: startMonth,
            $lt: endMonth
          }
        };
      } else {
        dateFilter = {
          receiptDate: {
            $gte: startYear,
            $lt: endYear
          }
        };
      }
    }

    // Get all receipts for this member
    const receipts = await Receipt.find({
      member: member._id,
      isActive: true,
      ...dateFilter
    })
    .sort({ receiptDate: -1 });

    // Calculate statistics
    const totalDonations = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const averageDonation = receipts.length > 0 ? totalDonations / receipts.length : 0;

    // Get donation frequency by month
    const monthlyDonations = await Receipt.aggregate([
      {
        $match: {
          member: member._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$receiptDate' },
            month: { $month: '$receiptDate' }
          },
          totalAmount: { $sum: '$amount' },
          receiptCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          receiptCount: 1
        }
      },
      {
        $sort: { year: -1, month: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        member,
        receipts,
        statistics: {
          totalDonations,
          averageDonation,
          totalReceipts: receipts.length,
          firstDonationDate: receipts.length > 0 ? receipts[receipts.length - 1].receiptDate : null,
          lastDonationDate: receipts.length > 0 ? receipts[0].receiptDate : null
        },
        monthlyDonations,
        filters: {
          year: year ? parseInt(year) : null,
          month: month ? parseInt(month) : null
        }
      }
    });
  } catch (error) {
    console.error('Get donor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get donor details by Dani Member Number
// @route   GET /api/donors/dani/:daniMemberNo
// @access  Private
const getDonorDetailsByDaniNumber = async (req, res) => {
  try {
    const { daniMemberNo } = req.params;
    const { year, month } = req.query;

    // Find member by Dani Member Number
    const member = await Member.findOne({ 
      daniMemberNo, 
      isActive: true 
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Build date filter for receipts
    let dateFilter = {};
    if (year) {
      const startYear = new Date(parseInt(year), 0, 1);
      const endYear = new Date(parseInt(year) + 1, 0, 1);
      
      if (month) {
        // Monthly filter
        const startMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endMonth = new Date(parseInt(year), parseInt(month), 1);
        dateFilter = {
          receiptDate: {
            $gte: startMonth,
            $lt: endMonth
          }
        };
      } else {
        // Yearly filter
        dateFilter = {
          receiptDate: {
            $gte: startYear,
            $lt: endYear
          }
        };
      }
    }

    // Find receipts for this member
    const receipts = await Receipt.find({
      member: member._id,
      ...dateFilter
    }).sort({ receiptDate: -1 });

    // Calculate statistics
    const totalDonations = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const totalReceipts = receipts.length;
    const averageDonation = totalReceipts > 0 ? totalDonations / totalReceipts : 0;
    
    const firstDonationDate = receipts.length > 0 ? receipts[receipts.length - 1].receiptDate : null;
    const lastDonationDate = receipts.length > 0 ? receipts[0].receiptDate : null;

    // Calculate monthly donations for the selected year
    const monthlyDonations = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(parseInt(year), i, 1);
      const monthEnd = new Date(parseInt(year), i + 1, 1);
      
      const monthReceipts = receipts.filter(receipt => 
        receipt.receiptDate >= monthStart && receipt.receiptDate < monthEnd
      );
      
      const monthTotal = monthReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
      
      monthlyDonations.push({
        month: months[i],
        amount: monthTotal,
        receiptCount: monthReceipts.length
      });
    }

    res.json({
      success: true,
      data: {
        member,
        receipts,
        statistics: {
          totalDonations,
          averageDonation,
          totalReceipts,
          firstDonationDate,
          lastDonationDate
        },
        monthlyDonations
      }
    });
  } catch (error) {
    console.error('Error fetching donor details by Dani Number:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getTopDonors,
  getDonationStats,
  getDonorDetails,
  getDonorDetailsByDaniNumber
};
