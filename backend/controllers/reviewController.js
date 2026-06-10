const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
    try {
        const { productId, rating } = req.body;
        const review = new Review({
            ...req.body,
            userId: req.user.id
        });
        await review.save();

        // Update Product Rating
        const reviews = await Review.find({ productId });
        const numReviews = reviews.length;
        const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        await Product.findByIdAndUpdate(productId, {
            averageRating,
            numReviews
        });

        res.json({ success: true, review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'firstName lastName');
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
