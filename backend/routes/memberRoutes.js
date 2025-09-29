const express = require('express');
const router = express.Router();
const {
  createMember,
  getMembers,
  searchMembers,
  getMemberByKey,
  updateMember,
  deleteMember,
  getNextRegNo,
  getMemberByDaniNumber,
  updateMemberByDaniNumber
} = require('../controllers/memberController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/members/next-reg-no
// @desc    Get next registration number
// @access  Private
router.get('/next-reg-no', getNextRegNo);

// @route   GET /api/members/dani/:daniMemberNo
// @desc    Get member by Dani Member Number
// @access  Private
router.get('/dani/:daniMemberNo', getMemberByDaniNumber);

// @route   PUT /api/members/dani/:daniMemberNo
// @desc    Update member by Dani Member Number
// @access  Private
router.put('/dani/:daniMemberNo', updateMemberByDaniNumber);

// @route   GET /api/members/search
// @desc    Search members
// @access  Private
router.get('/search', searchMembers);

// @route   GET /api/members
// @desc    Get all members with pagination
// @access  Private
router.get('/', getMembers);

// @route   POST /api/members
// @desc    Create a new member
// @access  Private
router.post('/', createMember);

// @route   GET /api/members/:universalKey
// @desc    Get member by universal key
// @access  Private
router.get('/:universalKey', getMemberByKey);

// @route   PUT /api/members/:universalKey
// @desc    Update member
// @access  Private
router.put('/:universalKey', updateMember);

// @route   DELETE /api/members/:universalKey
// @desc    Delete member (soft delete)
// @access  Private
router.delete('/:universalKey', deleteMember);

module.exports = router;
