const express = require("express");

const {
  createReview,
  getUserReviews
} = require("../controllers/reviewController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:transactionId", authMiddleware, createReview);

router.get("/user/:userId", authMiddleware, getUserReviews);

module.exports = router;
