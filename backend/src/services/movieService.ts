import { prisma } from "../prisma";
import { wouldCreateCycle, getRewatchPlan, MovieNode } from "../algorithms/graph";
import { AppError } from "../middlewares/errorHandler";
import { randomUUID } from "crypto";

export async function getAllMovies() {
  const movies = await prisma.movie.findMany({
    include: {
      prerequisites: {
        include: {
          prerequisite: true,
        },
      },
    },
    orderBy: { releaseYear: "asc" },
  });

  return movies.map((m) => ({
    id: m.id,
    title: m.title,
    releaseYear: m.releaseYear,
    runtime: m.runtime,
    watched: m.watched,
    prerequisites: m.prerequisites.map((p) => ({
      id: p.prerequisite.id,
      title: p.prerequisite.title,
    })),
  }));
}

export async function createMovie(data: {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisites?: string[];
  watched?: boolean;
}) {
  const movieId = randomUUID();
  const prereqIds = data.prerequisites || [];

  if (prereqIds.length > 0) {
    const allMovies = await prisma.movie.findMany({
      include: { prerequisites: true },
    });

    const graphMap = new Map<string, { prerequisites: string[] }>();
    allMovies.forEach((m) => {
      graphMap.set(m.id, {
        prerequisites: m.prerequisites.map((p) => p.prerequisiteId),
      });
    });

    if (wouldCreateCycle(graphMap, movieId, prereqIds)) {
      throw new AppError("Circular dependency detected", 409, "CIRCULAR_DEPENDENCY");
    }
  }

  const movie = await prisma.movie.create({
    data: {
      id: movieId,
      title: data.title,
      releaseYear: data.releaseYear,
      runtime: data.runtime,
      watched: data.watched ?? false,
      prerequisites: {
        create: prereqIds.map((pId) => ({
          prerequisiteId: pId,
        })),
      },
    },
    include: {
      prerequisites: {
        include: { prerequisite: true },
      },
    },
  });

  return {
    id: movie.id,
    title: movie.title,
    releaseYear: movie.releaseYear,
    runtime: movie.runtime,
    watched: movie.watched,
    prerequisites: movie.prerequisites.map((p) => ({
      id: p.prerequisite.id,
      title: p.prerequisite.title,
    })),
  };
}

export async function updateMovie(
  movieId: string,
  data: {
    title?: string;
    releaseYear?: number;
    runtime?: number;
    watched?: boolean;
    prerequisites?: string[];
  }
) {
  const existing = await prisma.movie.findUnique({
    where: { id: movieId },
    include: { prerequisites: true },
  });

  if (!existing) {
    throw new AppError("Movie not found", 404, "NOT_FOUND");
  }

  if (data.prerequisites !== undefined) {
    const allMovies = await prisma.movie.findMany({
      include: { prerequisites: true },
    });

    const graphMap = new Map<string, { prerequisites: string[] }>();
    allMovies.forEach((m) => {
      if (m.id !== movieId) {
        graphMap.set(m.id, {
          prerequisites: m.prerequisites.map((p) => p.prerequisiteId),
        });
      }
    });

    if (wouldCreateCycle(graphMap, movieId, data.prerequisites)) {
      throw new AppError("Circular dependency detected", 409, "CIRCULAR_DEPENDENCY");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.prerequisites !== undefined) {
      await tx.moviePrerequisite.deleteMany({
        where: { movieId },
      });

      if (data.prerequisites.length > 0) {
        await tx.moviePrerequisite.createMany({
          data: data.prerequisites.map((pId) => ({
            movieId,
            prerequisiteId: pId,
          })),
        });
      }
    }

    return tx.movie.update({
      where: { id: movieId },
      data: {
        title: data.title,
        releaseYear: data.releaseYear,
        runtime: data.runtime,
        watched: data.watched,
      },
      include: {
        prerequisites: {
          include: { prerequisite: true },
        },
      },
    });
  });

  return {
    id: updated.id,
    title: updated.title,
    releaseYear: updated.releaseYear,
    runtime: updated.runtime,
    watched: updated.watched,
    prerequisites: updated.prerequisites.map((p) => ({
      id: p.prerequisite.id,
      title: p.prerequisite.title,
    })),
  };
}

export async function getMovieRewatchOrder(movieId: string) {
  const allMovies = await prisma.movie.findMany({
    include: { prerequisites: true },
  });

  const movieMap = new Map<string, MovieNode>();
  allMovies.forEach((m) => {
    movieMap.set(m.id, {
      id: m.id,
      title: m.title,
      runtime: m.runtime,
      prerequisites: m.prerequisites.map((p) => p.prerequisiteId),
      watched: m.watched,
    });
  });

  if (!movieMap.has(movieId)) {
    throw new AppError("Movie not found", 404, "NOT_FOUND");
  }

  return getRewatchPlan(movieMap, movieId);
}