const Review = require("../models/Review");
const Transaction = require("../models/Transaction");

const createReview = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { rating, comment } = req.body;

        // Check transaction
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // Review only after transaction is completed
        if (transaction.status !== "completed") {
            return res.status(400).json({
                message: "You can review only after transaction is completed"
            });
        }

        const userId = req.userId.toString();

        const isOwner =
            transaction.owner.toString() === userId;

        const isBorrower =
            transaction.borrower.toString() === userId;

        // User must be part of the transaction
        if (!isOwner && !isBorrower) {
            return res.status(403).json({
                message: "You are not part of this transaction"
            });
        }

        // Decide who is being reviewed
        const reviewee = isOwner
            ? transaction.borrower
            : transaction.owner;

        // Prevent duplicate review
        const existingReview = await Review.findOne({
            transaction: transactionId,
            reviewer: req.userId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this transaction"
            });
        }

        const review = await Review.create({
            transaction: transactionId,
            reviewer: req.userId,
            reviewee,
            rating,
            comment
        });

        res.status(201).json({
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;

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
                ? (totalRating / totalReviews).toFixed(1)
                : 0;

        res.status(200).json({
            totalReviews,
            averageRating: Number(averageRating),
            reviews
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    createReview,
    getUserReviews
};