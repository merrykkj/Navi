import express from "express";
import authMiddleware from "../middlewares/AuthMiddleware.js";
import { getProfileController, putProfileController } from "../controllers/ProfileController.js";

const router = express.Router();

router.get('/', authMiddleware, getProfileController);
router.put('/', authMiddleware, putProfileController);

export default router;