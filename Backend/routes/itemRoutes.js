const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  addItem,
  getNearbyItems,
  getMyItems,
  updateItem,
  deleteItem,
  getItemById
} = require("../controllers/itemController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
    "/add",
    authMiddleware,
    upload.array("images", 4),
    addItem
);
router.get("/nearby", authMiddleware, getNearbyItems);
router.get("/my-items", authMiddleware, getMyItems);
router.get(
    "/:itemId",
    authMiddleware,
    getItemById
);
router.put(
    "/:itemId",
    authMiddleware,
    upload.array("images", 4),
    updateItem
);
router.delete("/:itemId", authMiddleware, deleteItem);

module.exports = router;
