const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generate OTP (6 digits)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user and send OTP
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);

        const user = await User.create({
            name,
            email,
            password,
            role,
            otp,
            otpExpires,
            isVerified: false
        });

        // Send OTP via email
        try {
            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Auth App!</h2>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>It expires in 10 minutes.</p>
                </div>
            `;
            await sendEmail({
                email: user.email,
                subject: 'Account Verification OTP',
                message, // Wait, I need to update utils/email.js to accept html
            });
            res.status(201).json({ message: 'User registered. Please check email for OTP.' });
        } catch (error) {
            console.error('Email sending error:', error);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent', error: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP for account activation
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            message: 'Email verified successfully!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email first via OTP' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;
        
        console.log(`[DEBUG] Generated Password Reset OTP for ${email}: ${otp}`);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false });

        try {
            const message = `Your password reset code is: ${otp}. It expires in 10 minutes.`;
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message,
            });
            res.json({ message: 'Password reset OTP sent to email' });
        } catch (error) {
            console.error('Email sending error:', error);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent', error: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
};
