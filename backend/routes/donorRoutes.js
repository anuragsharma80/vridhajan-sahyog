const express = require('express');
const router = express.Router();
const {
  getTopDonors,
  getDonationStats,
  getDonorDetails,
  getDonorDetailsByDaniNumber
} = require('../controllers/donorController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/donors/top
// @desc    Get top donors with filtering
// @access  Private
router.get('/top', getTopDonors);

// @route   GET /api/donors/stats
// @desc    Get donation statistics
// @access  Private
router.get('/stats', getDonationStats);

// @route   GET /api/donors/dani/:daniMemberNo
// @desc    Get donor details by Dani Member Number
// @access  Private
router.get('/dani/:daniMemberNo', getDonorDetailsByDaniNumber);

// @route   GET /api/donors/:universalKey
// @desc    Get donor details with donation history
// @access  Private
router.get('/:universalKey', getDonorDetails);

module.exports = router;
