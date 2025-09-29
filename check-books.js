const mongoose = require('mongoose');
const Receipt = require('./backend/models/receiptModel');

mongoose.connect('mongodb://127.0.0.1:27017/vridhajan-sahyog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Check book counts
  const bookCounts = await Receipt.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$bookNo', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  console.log('Book counts:');
  bookCounts.forEach(book => {
    console.log(`Book ${book._id}: ${book.count}/25 receipts`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
