const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    specifications: { type: String },
    buildQuality: { type: String },
    artisticDetails: { type: String },
    color: { type: String },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    faq: [{
        question: String,
        answer: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
