const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Items");
const Transaction = require("../models/Transaction");

// Send borrow request
const sendBorrowRequest = async (req, res) => {
    try {
        const { itemId } = req.body;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (item.status !== "available") {
            return res.status(400).json({
                message: "Item is not available"
            });
        }

        if (item.owner.toString() === req.userId.toString()) {
            return res.status(400).json({
                message: "You cannot request your own item"
            });
        }

        
        const existingRequest = await BorrowRequest.findOne({
            item: itemId,
            borrower: req.userId,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "Borrow request already sent"
            });
        }

        const request = await BorrowRequest.create({
            item: itemId,
            borrower: req.userId,
            owner: item.owner
        });

        res.status(201).json({
            message: "Borrow request sent successfully",
            request
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// Get borrow requests received by owner
const getMyRequests = async (req, res) => {
    try {
        const requests = await BorrowRequest.find({
            owner: req.userId
        })
        .populate("item", "title category price priceUnit")
        .populate("borrower", "name");

        res.status(200).json({
            message: "Borrow requests fetched successfully",
            requests
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// Accept borrow request
const acceptBorrowRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await BorrowRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Borrow request not found"
            });
        }

        // Only owner can accept
        if (request.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to accept this request"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Request has already been processed"
            });
        }

        // Accept request
        request.status = "accepted";
        await request.save();

       
        // Reject other pending requests
        await BorrowRequest.updateMany(
            {
                item: request.item,
                _id: { $ne: requestId },
                status: "pending"
            },
            {
                status: "rejected"
            }
        );

        // Create transaction
        const transaction = await Transaction.create({
            item: request.item,
            borrower: request.borrower,
            owner: request.owner,
            borrowRequest: request._id,
            status: "payment_pending"
        });

        res.status(200).json({
            message: "Borrow request accepted successfully",
            request,
            transaction
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// Reject borrow request
const rejectBorrowRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await BorrowRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Borrow request not found"
            });
        }

        // Only the owner can reject the request
        if (request.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to reject this request"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Request has already been processed"
            });
        }

        request.status = "rejected";
        await request.save();

        res.status(200).json({
            message: "Borrow request rejected successfully",
            request
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getAcceptedRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await BorrowRequest.findById(requestId)
            .populate("item", "title category price priceUnit location")
            .populate("borrower", "name phone")
            .populate("owner", "name phone");

        if (!request) {
            return res.status(404).json({
                message: "Borrow request not found"
            });
        }

        // Only borrower or owner can see contact details
        if (
            request.borrower._id.toString() !== req.userId.toString() &&
            request.owner._id.toString() !== req.userId.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this request"
            });
        }

        // Contact details only available after acceptance
        if (request.status !== "accepted") {
            return res.status(400).json({
                message: "Contact details are available after request acceptance"
            });
        }

        res.status(200).json({
            message: "Accepted request details fetched successfully",
            request
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getMyRequestForItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const request = await BorrowRequest.findOne({
            item: itemId,
            borrower: req.userId,
            status: {
                $in: ["pending", "accepted"]
            }
        });

        res.status(200).json({
            status: request ? request.status : null
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};
// Get borrow requests sent by borrower
const getMySentRequests = async (req, res) => {
    try {
        const requests = await BorrowRequest.find({
            borrower: req.userId
        })
            .populate(
                "item",
                "title category price priceUnit"
            )
            .populate(
                "owner",
                "name"
            );

        res.status(200).json({
            message: "Sent borrow requests fetched successfully",
            requests
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const deleteBorrowRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await BorrowRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Borrow request not found"
            });
        }

        const userId = req.userId.toString();

        if (
            request.borrower.toString() !== userId &&
            request.owner.toString() !== userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this request"
            });
        }

        if (request.status === "pending") {
            return res.status(400).json({
                message: "Pending requests cannot be deleted"
            });
        }

        await BorrowRequest.findByIdAndDelete(requestId);

        res.status(200).json({
            message: "Borrow request deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    sendBorrowRequest,
    getMyRequests,
    acceptBorrowRequest,
    rejectBorrowRequest,
    getAcceptedRequest,
    getMyRequestForItem,
    getMySentRequests,
    deleteBorrowRequest
};