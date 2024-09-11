import express from "express";
import {
  createCharacter,
  deleteCharacter,
  getCharacter,
} from "../controllers/characterController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { purchaseItems } from "../controllers/purchaseController.js";
import { sellItems } from "../controllers/sellController.js";
import { getInventory } from "../controllers/inventoryController.js";
import { getEquippedItems } from "../controllers/equippedItemsController.js";
import { equipItem } from "../controllers/equipController.js";

const router = express.Router();

router.post("/", authMiddleware, createCharacter);
router.delete("/:id", authMiddleware, deleteCharacter);
router.get("/:id", authMiddleware, getCharacter);
router.post("/:id/purchase", authMiddleware, purchaseItems);
router.post("/:id/sell", authMiddleware, sellItems);
router.get("/:id/inventory", authMiddleware, getInventory);
router.get("/:id/equipped", getEquippedItems); // 인증 불필요
router.post("/:id/equip", authMiddleware, equipItem);

export default router;
