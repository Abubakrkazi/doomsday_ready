import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as movieService from "../services/movieService";

const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  releaseYear: z.number().int().min(1900).max(2100),
  runtime: z.number().int().min(1).max(300, "Runtime must be between 1 and 300 minutes"),
  prerequisites: z.array(z.string()).optional(),
  watched: z.boolean().optional(),
});

const updateMovieSchema = z.object({
  title: z.string().min(1).optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  runtime: z.number().int().min(1).max(300).optional(),
  prerequisites: z.array(z.string()).optional(),
  watched: z.boolean().optional(),
});

export async function getMovies(req: Request, res: Response, next: NextFunction) {
  try {
    const movies = await movieService.getAllMovies();
    res.json(movies);
  } catch (error) {
    next(error);
  }
}

export async function createMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createMovieSchema.parse(req.body);
    const movie = await movieService.createMovie(validated);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
}

export async function updateMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateMovieSchema.parse(req.body);
    const updated = await movieService.updateMovie(id, validated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function getRewatchOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await movieService.getMovieRewatchOrder(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}