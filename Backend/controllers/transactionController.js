const Transaction = require("../models/Transaction");
const Item = require("../models/Items");

const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { borrower: req.userId },
                { owner: req.userId }
            ]
        })
            .populate(
                "item",
                "title description category price priceUnit location images"
            )
            .populate("borrower", "name phone")
            .populate("owner", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Transactions fetched successfully",
            transactions
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Get my borrowed items
const getMyBorrowedItems = async (req, res) => {
    try {
        const { type } = req.query;

        let filter = {
            borrower: req.userId
        };

        // Currently active borrowing
        if (type === "active") {
            filter.status = {
                $in: [
                    "payment_pending",
                    "paid",
                    "pickup_scheduled",
                    "handed_over",
                    "borrowed"
                ]
            };
        }

        // Completed borrowing history
        if (type === "history") {
            filter.status = {
                $in: [
                    "returned",
                    "completed"
                ]
            };
        }

        const transactions = await Transaction.find(filter)
            .populate(
                "item",
                "title description category price priceUnit"
            )
            .populate("owner", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Borrowed items fetched successfully",
            transactions
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Update transaction status
const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status, pickupDate, returnDate } = req.body;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        const userId = req.userId.toString();

        const isBorrower =
            transaction.borrower.toString() === userId;

        const isOwner =
            transaction.owner.toString() === userId;

        if (!isBorrower && !isOwner) {
            return res.status(403).json({
                message: "You are not authorized to update this transaction"
            });
        }

        /*
         * ROLE-BASED STATUS FLOW
         */

        // Borrower schedules pickup for cash payment
        if (
            transaction.status === "payment_pending" &&
            status === "pickup_scheduled"
        ) {
            if (!isBorrower) {
                return res.status(403).json({
                    message: "Only the borrower can schedule pickup"
                });
            }

            if (transaction.paymentMethod !== "cash") {
                return res.status(400).json({
                    message: "Pickup can only be scheduled after selecting cash payment"
                });
            }

            if (!pickupDate) {
                return res.status(400).json({
                    message: "Pickup date is required"
                });
            }

            transaction.status = "pickup_scheduled";
            transaction.pickupDate = pickupDate;
        }

        // Owner confirms cash payment
        else if (
            transaction.status === "pickup_scheduled" &&
            status === "paid"
        ) {
            if (!isOwner) {
                return res.status(403).json({
                    message: "Only the owner can confirm cash payment"
                });
            }

            if (transaction.paymentMethod !== "cash") {
                return res.status(400).json({
                    message: "Invalid payment method"
                });
            }

            transaction.status = "paid";
        }

        // Owner hands over item
        else if (
            transaction.status === "paid" &&
            status === "handed_over"
        ) {
            if (!isOwner) {
                return res.status(403).json({
                    message: "Only the owner can hand over the item"
                });
            }

            transaction.status = "handed_over";
        }

        // Borrower confirms receiving item
        else if (
            transaction.status === "handed_over" &&
            status === "borrowed"
        ) {
            if (!isBorrower) {
                return res.status(403).json({
                    message: "Only the borrower can confirm receiving the item"
                });
            }

            transaction.status = "borrowed";
        }

        // Borrower returns item
        else if (
            transaction.status === "borrowed" &&
            status === "returned"
        ) {
            if (!isBorrower) {
                return res.status(403).json({
                    message: "Only the borrower can return the item"
                });
            }

            transaction.status = "returned";

            if (returnDate) {
                transaction.returnDate = returnDate;
            }
        }

        // Owner confirms returned item
        else if (
            transaction.status === "returned" &&
            status === "completed"
        ) {
            if (!isOwner) {
                return res.status(403).json({
                    message: "Only the owner can complete the transaction"
                });
            }

            transaction.status = "completed";
        }

        else {
            return res.status(400).json({
                message:
                    `Cannot change status from ${transaction.status} to ${status}`
            });
        }

        await transaction.save();

        const updatedTransaction = await Transaction.findById(transaction._id)
            .populate(
                "item",
                "title description category price priceUnit location images"
            )
            .populate("borrower", "name phone")
            .populate("owner", "name phone");

        res.status(200).json({
            message: "Transaction status updated successfully",
            transaction: updatedTransaction
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const choosePaymentMethod = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { paymentMethod } = req.body;

        if (!["cash", "razorpay"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // Only borrower can choose payment method
        if (transaction.borrower.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "Only the borrower can choose the payment method"
            });
        }

        // Payment method can only be selected while payment is pending
        if (transaction.status !== "payment_pending") {
            return res.status(400).json({
                message: "Payment method cannot be changed now"
            });
        }

        transaction.paymentMethod = paymentMethod;

        await transaction.save();

        res.status(200).json({
            message: "Payment method selected successfully",
            transaction
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const deleteCompletedTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        if (
            transaction.borrower.toString() !== req.userId.toString() &&
            transaction.owner.toString() !== req.userId.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this transaction"
            });
        }

        if (transaction.status !== "completed") {
            return res.status(400).json({
                message: "Only completed transactions can be deleted"
            });
        }

        await Transaction.findByIdAndDelete(transactionId);

        res.status(200).json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    getMyTransactions,
    getMyBorrowedItems,
    updateTransactionStatus,
    choosePaymentMethod,
    deleteCompletedTransaction
};