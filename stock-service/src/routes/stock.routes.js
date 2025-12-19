import { Router } from "express";
import { 
    initializeStock, 
    reserveStock, 
    getCurrentStock 
} from "../controllers/stock.controller.js";

const router = Router();

router.route("/initialize").post(initializeStock);
router.route("/reserve").post(reserveStock);
router.route("/current").get(getCurrentStock);

export default router;