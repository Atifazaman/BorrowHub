const express = require("express");

const {
  signup,
  login,
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile/:userId", authMiddleware, getUserProfile);

router.get("/me", authMiddleware, getMyProfile);

router.put("/me", authMiddleware, updateMyProfile);

router.delete("/me", authMiddleware, deleteMyAccount);

module.exports = router;
