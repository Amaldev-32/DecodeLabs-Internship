const Seller = require('../models/Seller');
const User = require('../models/User');

exports.registerSeller = async (req, res) => {
    const { profession, experience, description, termsAccepted } = req.body;

    try {
        const existingSeller = await Seller.findOne({ userId: req.user.id });
        if (existingSeller) {
            return res.status(400).json({ success: false, message: 'Already registered as a seller' });
        }

        const seller = new Seller({
            userId: req.user.id,
            profession,
            experience,
            description,
            termsAccepted
        });

        await seller.save();

        // Update User status
        await User.findByIdAndUpdate(req.user.id, { isSeller: true });

        res.json({ success: true, message: 'Registered as seller successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSellerProfile = async (req, res) => {
    try {
        const seller = await Seller.findOne({ userId: req.user.id }).populate('userId', 'firstName lastName email phone');
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller profile not found' });
        }
        res.json({ success: true, seller });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
