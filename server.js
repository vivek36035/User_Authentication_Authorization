const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
    // Create a default admin user if one doesn't exist
    try {
        const adminExists = await User.findOne({ email: 'vivekzambre41@gmail.com' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'vivekzambre41@gmail.com',
                password: 'adminpassword',
                role: 'admin',
                isVerified: true // Automatically verified so no OTP needed
            });
            console.log('✅ Default Admin Account created!');
            console.log('Email: vivekzambre41@gmail.com');
            console.log('Password: adminpassword');
        }
    } catch (error) {
        console.error('Error creating default admin:', error.message);
    }
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler middleware (basic)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
