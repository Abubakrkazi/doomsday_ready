export interface MovieNode {
  id: string;
  title: string;
  runtime: number;
  prerequisites: string[];
  watched: boolean;
}

export function wouldCreateCycle(
  movieMap: Map<string, { prerequisites: string[] }>,
  movieId: string,
  proposedPrerequisites: string[]
): boolean {
  if (proposedPrerequisites.includes(movieId)) {
    return true;
  }

  const visited = new Set<string>();
  const queue: string[] = [...proposedPrerequisites];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === movieId) {
      return true;
    }

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const currentMovie = movieMap.get(currentId);
      if (currentMovie && currentMovie.prerequisites) {
        for (const prereqId of currentMovie.prerequisites) {
          if (prereqId === movieId) {
            return true;
          }
          if (!visited.has(prereqId)) {
            queue.push(prereqId);
          }
        }
      }
    }
  }

  return false;
}

export interface RewatchOrderResult {
  order: MovieNode[];
  watchedCount: number;
  totalCount: number;
  remainingRuntime: number;
}

export function getRewatchPlan(
  movieMap: Map<string, MovieNode>,
  targetMovieId: string
): RewatchOrderResult {
  const targetMovie = movieMap.get(targetMovieId);
  if (!targetMovie) {
    throw new Error(`Movie with ID "${targetMovieId}" not found`);
  }

  const requiredMovieIds = new Set<string>();
  const queue: string[] = [...(targetMovie.prerequisites || [])];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!requiredMovieIds.has(currentId) && currentId !== targetMovieId) {
      requiredMovieIds.add(currentId);
      const currentMovie = movieMap.get(currentId);
      if (currentMovie && currentMovie.prerequisites) {
        for (const prereqId of currentMovie.prerequisites) {
          if (!requiredMovieIds.has(prereqId)) {
            queue.push(prereqId);
          }
        }
      }
    }
  }

  if (requiredMovieIds.size === 0) {
    return {
      order: [],
      watchedCount: 0,
      totalCount: 0,
      remainingRuntime: 0,
    };
  }

  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of requiredMovieIds) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const id of requiredMovieIds) {
    const movie = movieMap.get(id);
    if (!movie) continue;

    for (const prereqId of movie.prerequisites || []) {
      if (requiredMovieIds.has(prereqId)) {
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
        dependents.get(prereqId)?.push(id);
      }
    }
  }

  const readyQueue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      readyQueue.push(id);
    }
  }

  const orderedIds: string[] = [];

  while (readyQueue.length > 0) {
    const currentId = readyQueue.shift()!;
    orderedIds.push(currentId);

    const deps = dependents.get(currentId) || [];
    for (const depId of deps) {
      const newDeg = (inDegree.get(depId) || 0) - 1;
      inDegree.set(depId, newDeg);
      if (newDeg === 0) {
        readyQueue.push(depId);
      }
    }
  }

  const order: MovieNode[] = orderedIds
    .map((id) => movieMap.get(id))
    .filter((m): m is MovieNode => m !== undefined);

  let watchedCount = 0;
  let remainingRuntime = 0;

  for (const movie of order) {
    if (movie.watched) {
      watchedCount++;
    } else {
      remainingRuntime += movie.runtime;
    }
  }

  return {
    order,
    watchedCount,
    totalCount: order.length,
    remainingRuntime,
  };
}