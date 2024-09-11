import express from "express";
import {
  createItem,
  updateItem,
  getItem,
  getItems,
} from "../controllers/itemController.js";

const router = express.Router();

router.post("/", createItem);
router.patch("/:id", updateItem);
router.get("/:id", getItem);
router.get("/", getItems);

export default router;
