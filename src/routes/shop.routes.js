import { Router } from "express";

import { getProducts, buyProduct } from "../controllers/shop.controllers.js";
import { mockAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/iphones").get(getProducts);
router.route("/buy").post(mockAuth, buyProduct);

export default router;
