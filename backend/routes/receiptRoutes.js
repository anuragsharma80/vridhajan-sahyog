const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/receiptController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/receipts/member/dani/:daniMemberNo
// @desc    Get member by Dani Member Number for receipt entry
// @access  Private
router.get('/member/dani/:daniMemberNo', getMemberByDaniForReceipt);

// @route   GET /api/receipts/next-receipt/:bookNo
// @desc    Get next receipt number for a book
// @access  Private
router.get('/next-receipt/:bookNo', getNextReceiptNumber);

// @route   GET /api/receipts/check-duplicate/:bookNo/:receiptNo
// @desc    Check if receipt combination exists
// @access  Private
router.get('/check-duplicate/:bookNo/:receiptNo', checkReceiptDuplicate);

// @route   GET /api/receipts/book-count/:bookNo
// @desc    Check if a receipt book is full (25 receipts)
// @access  Private
router.get('/book-count/:bookNo', checkBookCount);

// @route   GET /api/receipts/member/:universalKey
// @desc    Get receipts by member
// @access  Private
router.get('/member/:universalKey', getReceiptsByMember);

// @route   GET /api/receipts
// @desc    Get all receipts with pagination
// @access  Private
router.get('/', getReceipts);

// @route   POST /api/receipts
// @desc    Create a new receipt
// @access  Private
router.post('/', createReceipt);

// @route   GET /api/receipts/:id
// @desc    Get receipt by ID
// @access  Private
router.get('/:id', getReceiptById);

// @route   PUT /api/receipts/:id
// @desc    Update receipt
// @access  Private
router.put('/:id', updateReceipt);

// @route   DELETE /api/receipts/:id
// @desc    Delete receipt (soft delete)
// @access  Private
router.delete('/:id', deleteReceipt);

module.exports = router;
