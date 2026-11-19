import { Router } from "express";
import * as movieController from "../controllers/movieController";

const router = Router();

router.get("/", movieController.getMovies);
router.post("/", movieController.createMovie);
router.patch("/:id", movieController.updateMovie);
router.get("/:id/rewatch-order", movieController.getRewatchOrder);

export default router;