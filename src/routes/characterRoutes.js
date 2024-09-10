const express = require("express");
const {
  createCharacter,
  deleteCharacter,
  getCharacter,
} = require("../controllers/characterController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createCharacter);
router.delete("/:id", authMiddleware, deleteCharacter);
router.get("/:id", authMiddleware, getCharacter);

module.exports = router;
