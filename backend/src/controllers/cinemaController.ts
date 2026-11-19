import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as cinemaService from "../services/cinemaService";

const createCinemaSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  bundleSizes: z
    .array(z.number().int().min(1).max(500, "Bundle size must be between 1 and 500 seats"))
    .min(1, "At least 1 bundle size is required")
    .max(10, "A cinema can have at most 10 bundle sizes"),
});

export async function getCinemas(req: Request, res: Response, next: NextFunction) {
  try {
    const cinemas = await cinemaService.getAllCinemas();
    res.json(cinemas);
  } catch (error) {
    next(error);
  }
}

export async function createCinema(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createCinemaSchema.parse(req.body);
    const cinema = await cinemaService.createCinema(validated);
    res.status(201).json(cinema);
  } catch (error) {
    next(error);
  }
}

export async function getBookingQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const groupSize = parseInt(req.query.groupSize as string, 10);

    if (isNaN(groupSize) || groupSize < 1 || groupSize > 10000) {
      return res.status(400).json({
        error: "INVALID_GROUP_SIZE",
        message: "groupSize must be an integer between 1 and 10,000",
      });
    }

    const quote = await cinemaService.getBookingQuote(id, groupSize);
    res.json(quote);
  } catch (error) {
    next(error);
  }
}