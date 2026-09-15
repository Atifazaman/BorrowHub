const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        borrower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        borrowRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BorrowRequest",
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "razorpay"],
        },

        status: {
            type: String,
            enum: [
                "payment_pending",
                "paid",
                "pickup_scheduled",
                "handed_over",
                "borrowed",
                "returned",
                "completed"
            ],
            default: "payment_pending"
        },

        pickupDate: {
            type: Date
        },

        returnDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);

module.exports = Transaction;