const User = require("../models/User");
const Review = require("../models/Review");
const Item = require("../models/Items");
const BorrowRequest = require("../models/BorrowRequest");
const Transaction = require("../models/Transaction");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    try {
        const { name, email,phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const reviews = await Review.find({
            reviewee: userId
        })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number((totalRating / totalReviews).toFixed(1))
                : 0;

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name
            },

            rating: {
                averageRating,
                totalReviews
            },

            reviews
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("name email phone location");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const reviews = await Review.find({
            reviewee: req.userId
        })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number((totalRating / totalReviews).toFixed(1))
                : 0;

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location
            },

            rating: {
                averageRating,
                totalReviews
            },

            reviews
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const { name, phone, location } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (location !== undefined) {
            user.location = location;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const deleteMyAccount = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Delete user's items
        await Item.deleteMany({
            owner: userId
        });

        // Delete borrow requests related to the user
        await BorrowRequest.deleteMany({
            $or: [
                { borrower: userId },
                { owner: userId }
            ]
        });

        // Delete transactions related to the user
        await Transaction.deleteMany({
            $or: [
                { borrower: userId },
                { owner: userId }
            ]
        });

        // Delete reviews given by or received by the user
        await Review.deleteMany({
            $or: [
                { reviewer: userId },
                { reviewee: userId }
            ]
        });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Unable to delete account"
        });
    }
};

module.exports = {
    signup,
    login,
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    deleteMyAccount
};