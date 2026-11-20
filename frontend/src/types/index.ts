export interface MoviePrerequisiteRef {
  id: string;
  title: string;
}

export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: MoviePrerequisiteRef[];
}

export interface CreateMovieInput {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisites?: string[];
  watched?: boolean;
}

export interface UpdateMovieInput {
  title?: string;
  releaseYear?: number;
  runtime?: number;
  watched?: boolean;
  prerequisites?: string[];
}

export interface RewatchOrderResult {
  order: Movie[];
  watchedCount: number;
  totalCount: number;
  remainingRuntime: number;
}

export interface Cinema {
  id: string;
  name: string;
  bundleSizes: number[];
}

export interface CreateCinemaInput {
  name: string;
  bundleSizes: number[];
}

export interface BundleBreakdown {
  size: number;
  count: number;
}

export interface BookingQuoteResult {
  possible: boolean;
  groupSize: number;
  totalBundles: number;
  breakdown: BundleBreakdown[];
  summary: string;
}

export interface DashboardStats {
  totalMovies: number;
  watchedMovies: number;
  unwatchedMovies: number;
  totalCinemas: number;
  totalRuntimeHours: number;
}