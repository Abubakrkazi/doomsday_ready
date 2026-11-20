import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.moviePrerequisite.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.cinemaBundle.deleteMany();
  await prisma.cinema.deleteMany();

  const ironMan = await prisma.movie.create({
    data: { id: "iron-man", title: "Iron Man", releaseYear: 2008, runtime: 126, watched: true },
  });

  const firstAvenger = await prisma.movie.create({
    data: { id: "first-avenger", title: "Captain America: The First Avenger", releaseYear: 2011, runtime: 124, watched: true },
  });

  const avengers = await prisma.movie.create({
    data: {
      id: "the-avengers",
      title: "The Avengers",
      releaseYear: 2012,
      runtime: 143,
      watched: true,
      prerequisites: {
        create: [{ prerequisiteId: ironMan.id }, { prerequisiteId: firstAvenger.id }],
      },
    },
  });

  const civilWar = await prisma.movie.create({
    data: {
      id: "civil-war",
      title: "Captain America: Civil War",
      releaseYear: 2016,
      runtime: 147,
      watched: false,
      prerequisites: {
        create: [{ prerequisiteId: avengers.id }],
      },
    },
  });

  const ragnarok = await prisma.movie.create({
    data: { id: "ragnarok", title: "Thor: Ragnarok", releaseYear: 2017, runtime: 130, watched: false },
  });

  const infinityWar = await prisma.movie.create({
    data: {
      id: "infinity-war",
      title: "Avengers: Infinity War",
      releaseYear: 2018,
      runtime: 149,
      watched: false,
      prerequisites: {
        create: [{ prerequisiteId: civilWar.id }, { prerequisiteId: ragnarok.id }],
      },
    },
  });

  const endgame = await prisma.movie.create({
    data: {
      id: "endgame",
      title: "Avengers: Endgame",
      releaseYear: 2019,
      runtime: 181,
      watched: false,
      prerequisites: {
        create: [{ prerequisiteId: infinityWar.id }],
      },
    },
  });

  await prisma.movie.create({
    data: {
      id: "doomsday",
      title: "Avengers: Doomsday",
      releaseYear: 2026,
      runtime: 180,
      watched: false,
      prerequisites: {
        create: [{ prerequisiteId: endgame.id }],
      },
    },
  });

  await prisma.cinema.create({
    data: {
      name: "Grand Cineplex (Bundles: 1, 3, 4)",
      bundles: { create: [{ seatCount: 1 }, { seatCount: 3 }, { seatCount: 4 }] },
    },
  });

  await prisma.cinema.create({
    data: {
      name: "Star Arena (Bundles: 2, 5)",
      bundles: { create: [{ seatCount: 2 }, { seatCount: 5 }] },
    },
  });

  await prisma.cinema.create({
    data: {
      name: "Marvel IMAX (Bundles: 6, 9, 20)",
      bundles: { create: [{ seatCount: 6 }, { seatCount: 9 }, { seatCount: 20 }] },
    },
  });

  await prisma.cinema.create({
    data: {
      name: "Classic Cinema (Bundles: 4, 6)",
      bundles: { create: [{ seatCount: 4 }, { seatCount: 6 }] },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });