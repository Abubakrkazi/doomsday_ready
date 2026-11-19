export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: { id: string; title: string }[];
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

export interface BookingQuoteResult {
  possible: boolean;
  groupSize: number;
  totalBundles: number;
  breakdown: { size: number; count: number }[];
  summary: string;
}