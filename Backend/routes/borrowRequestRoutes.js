const express = require("express");

const {
  sendBorrowRequest,
  getMyRequests,
  acceptBorrowRequest,
  rejectBorrowRequest,
  getAcceptedRequest,
  getMyRequestForItem,
  getMySentRequests,
  deleteBorrowRequest
} = require("../controllers/borrowRequestController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, sendBorrowRequest);

router.get("/my-requests", authMiddleware, getMyRequests);

router.get("/item/:itemId", authMiddleware, getMyRequestForItem);
router.get("/my-sent-requests", authMiddleware, getMySentRequests);

router.put("/:requestId/accept", authMiddleware, acceptBorrowRequest);

router.put("/:requestId/reject", authMiddleware, rejectBorrowRequest);

router.get("/:requestId/accepted", authMiddleware, getAcceptedRequest);
router.delete(
    "/:requestId",
    authMiddleware,
    deleteBorrowRequest
);

module.exports = router;
