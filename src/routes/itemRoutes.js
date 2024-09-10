const express = require("express");
const {
  createItem,
  updateItem,
  getItem,
  getItems,
} = require("../controllers/itemController");
const router = express.Router();

router.post("/", createItem);
router.put("/:id", updateItem);
router.get("/:id", getItem);
router.get("/", getItems);

module.exports = router;
