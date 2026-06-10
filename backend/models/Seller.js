const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profession: { type: String, required: true },
    experience: { type: String, required: true },
    description: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Seller', sellerSchema);
