const BuyRequest = require('../models/BuyRequest');
const Product = require('../models/Product');

exports.createRequest = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (product.stock < (quantity || 1)) {
            return res.status(400).json({ success: false, message: 'Insufficient stock available' });
        }

        const buyRequest = new BuyRequest({
            productId,
            buyerId: req.user.id,
            sellerId: product.sellerId,
            quantity
        });

        await buyRequest.save();
        res.json({ success: true, buyRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSellerRequests = async (req, res) => {
    try {
        const requests = await BuyRequest.find({ sellerId: req.user.id })
            .populate('productId', 'name price')
            .populate('buyerId', 'firstName lastName email phone');
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateRequestStatus = async (req, res) => {
    const { status } = req.body; // Approved or Rejected

    try {
        const request = await BuyRequest.findOne({ _id: req.params.id, sellerId: req.user.id });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        request.status = status;
        await request.save();

        if (status === 'Approved') {
            const product = await Product.findById(request.productId);
            if (product.stock < request.quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock to approve this request' });
            }
            // Decrement stock
            await Product.findByIdAndUpdate(request.productId, { $inc: { stock: -request.quantity } });
        }

        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
