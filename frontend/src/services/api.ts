import axios from "axios";
import { Movie, RewatchOrderResult, Cinema, BookingQuoteResult } from "../types";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getMovies = async (): Promise<Movie[]> => {
  const res = await api.get("/movies");
  return res.data;
};

export const createMovie = async (data: {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisites: string[];
}): Promise<Movie> => {
  const res = await api.post("/movies", data);
  return res.data;
};

export const updateMovie = async (
  id: string,
  data: Partial<{
    title: string;
    releaseYear: number;
    runtime: number;
    watched: boolean;
    prerequisites: string[];
  }>
): Promise<Movie> => {
  const res = await api.patch(`/movies/${id}`, data);
  return res.data;
};

export const getRewatchOrder = async (id: string): Promise<RewatchOrderResult> => {
  const res = await api.get(`/movies/${id}/rewatch-order`);
  return res.data;
};

export const getCinemas = async (): Promise<Cinema[]> => {
  const res = await api.get("/cinemas");
  return res.data;
};

export const createCinema = async (data: {
  name: string;
  bundleSizes: number[];
}): Promise<Cinema> => {
  const res = await api.post("/cinemas", data);
  return res.data;
};

export const getBookingQuote = async (
  cinemaId: string,
  groupSize: number
): Promise<BookingQuoteResult> => {
  const res = await api.get(`/cinemas/${cinemaId}/booking?groupSize=${groupSize}`);
  return res.data;
};