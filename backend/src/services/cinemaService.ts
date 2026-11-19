import { prisma } from "../prisma";
import { calculateFewestBundles } from "../algorithms/knapsack";
import { AppError } from "../middlewares/errorHandler";

export async function getAllCinemas() {
  const cinemas = await prisma.cinema.findMany({
    include: { bundles: { orderBy: { seatCount: "asc" } } },
    orderBy: { name: "asc" },
  });

  return cinemas.map((c) => ({
    id: c.id,
    name: c.name,
    bundleSizes: c.bundles.map((b) => b.seatCount),
  }));
}

export async function createCinema(data: { name: string; bundleSizes: number[] }) {
  const uniqueSizes = Array.from(new Set(data.bundleSizes));

  const cinema = await prisma.cinema.create({
    data: {
      name: data.name,
      bundles: {
        create: uniqueSizes.map((size) => ({ seatCount: size })),
      },
    },
    include: { bundles: { orderBy: { seatCount: "asc" } } },
  });

  return {
    id: cinema.id,
    name: cinema.name,
    bundleSizes: cinema.bundles.map((b) => b.seatCount),
  };
}

export async function getBookingQuote(cinemaId: string, groupSize: number) {
  const cinema = await prisma.cinema.findUnique({
    where: { id: cinemaId },
    include: { bundles: true },
  });

  if (!cinema) {
    throw new AppError("Cinema not found", 404, "NOT_FOUND");
  }

  const bundleSizes = cinema.bundles.map((b) => b.seatCount);
  return calculateFewestBundles(bundleSizes, groupSize);
}