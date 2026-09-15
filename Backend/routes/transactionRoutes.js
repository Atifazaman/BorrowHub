const express = require("express");

const {
    getMyTransactions,
    updateTransactionStatus,
    getMyBorrowedItems,
    choosePaymentMethod,
    deleteCompletedTransaction
} = require("../controllers/transactionController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/my-transactions", authMiddleware, getMyTransactions);

router.put(
    "/:transactionId/status",
    authMiddleware,
    updateTransactionStatus
);

router.get(
    "/my-borrowed-items",
    authMiddleware,
    getMyBorrowedItems
);

router.put(
    "/:transactionId/payment-method",
    authMiddleware,
    choosePaymentMethod
);
router.delete(
    "/:transactionId",
    authMiddleware,
    deleteCompletedTransaction
);

module.exports = router;