const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            sellerId: req.user.id
        });
        await product.save();
        res.json({ success: true, product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProducts = async (req, res) => {
    const { category, minPrice, maxPrice, search, sort, sellerId, color, minRating } = req.query;
    let query = {};

    if (category) query.category = category;
    if (color) query.color = color;
    if (minRating) query.averageRating = { $gte: Number(minRating) };
    if (sellerId) query.sellerId = sellerId;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    try {
        let productsQuery = Product.find(query);

        if (sort === 'low-high') productsQuery = productsQuery.sort({ price: 1 });
        else if (sort === 'high-low') productsQuery = productsQuery.sort({ price: -1 });

        const products = await productsQuery.populate('sellerId', 'firstName lastName');
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('sellerId', 'firstName lastName email phone');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.user.id },
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
