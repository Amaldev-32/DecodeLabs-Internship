const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Simulate OTP sending
exports.sendOTP = async (req, res) => {
    const { email, phone } = req.body;
    // In a real app, send OTP via email/SMS here
    console.log(`Sending OTP to: ${email || phone}`);
    res.json({ success: true, message: 'OTP sent successfully (Simulated: 123456)' });
};

// Verify OTP and Register/Login
exports.verifyOTP = async (req, res) => {
    const { email, phone, otp, firstName, lastName, gender, profileImage } = req.body;

    if (otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phone) {
            user = await User.findOne({ phone });
        }

        if (!user) {
            // New user registration
            if (!firstName || !lastName || !gender) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'OTP verified. Please complete your registration.',
                    isNewUser: true 
                });
            }

            user = new User({
                firstName,
                lastName,
                gender,
                email,
                phone,
                profileImage
            });
            await user.save();
        }

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isSeller: user.isSeller
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
