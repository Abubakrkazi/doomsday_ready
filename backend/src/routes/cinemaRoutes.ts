import { Router } from "express";
import * as cinemaController from "../controllers/cinemaController";

const router = Router();

router.get("/", cinemaController.getCinemas);
router.post("/", cinemaController.createCinema);
router.get("/:id/booking", cinemaController.getBookingQuote);

export default router;