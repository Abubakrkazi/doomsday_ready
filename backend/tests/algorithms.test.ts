import { describe, it, expect } from "vitest";
import { wouldCreateCycle, getRewatchPlan, MovieNode } from "../src/algorithms/graph";
import { calculateFewestBundles } from "../src/algorithms/knapsack";

describe("Feature 1: Graph Algorithms", () => {
  const movies: MovieNode[] = [
    { id: "iron-man", title: "Iron Man", runtime: 126, prerequisites: [], watched: true },
    { id: "first-avenger", title: "Captain America: The First Avenger", runtime: 124, prerequisites: [], watched: true },
    { id: "avengers", title: "The Avengers", runtime: 143, prerequisites: ["iron-man", "first-avenger"], watched: true },
    { id: "civil-war", title: "Captain America: Civil War", runtime: 147, prerequisites: ["avengers"], watched: false },
    { id: "ragnarok", title: "Thor: Ragnarok", runtime: 130, prerequisites: [], watched: false },
    { id: "infinity-war", title: "Avengers: Infinity War", runtime: 149, prerequisites: ["civil-war", "ragnarok"], watched: false },
    { id: "endgame", title: "Avengers: Endgame", runtime: 181, prerequisites: ["infinity-war"], watched: false },
    { id: "doomsday", title: "Avengers: Doomsday", runtime: 180, prerequisites: ["endgame"], watched: false },
  ];

  const movieMap = new Map<string, MovieNode>();
  movies.forEach((m) => movieMap.set(m.id, { ...m }));

  it("should return empty order for Thor: Ragnarok", () => {
    const result = getRewatchPlan(movieMap, "ragnarok");
    expect(result.order).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it("should return correct rewatch order for Captain America: Civil War", () => {
    const result = getRewatchPlan(movieMap, "civil-war");
    const titles = result.order.map((m) => m.title);

    expect(titles).not.toContain("Captain America: Civil War");
    expect(titles).toHaveLength(3);
    expect(titles).toContain("Iron Man");
    expect(titles).toContain("Captain America: The First Avenger");
    expect(titles).toContain("The Avengers");

    const avengersIdx = titles.indexOf("The Avengers");
    const ironManIdx = titles.indexOf("Iron Man");
    const firstAvengerIdx = titles.indexOf("Captain America: The First Avenger");

    expect(avengersIdx).toBeGreaterThan(ironManIdx);
    expect(avengersIdx).toBeGreaterThan(firstAvengerIdx);
  });

  it("should return all 7 movies in valid order for Avengers: Doomsday", () => {
    const result = getRewatchPlan(movieMap, "doomsday");
    const titles = result.order.map((m) => m.title);

    expect(titles).toHaveLength(7);
    expect(titles).not.toContain("Avengers: Doomsday");

    const idx = (t: string) => titles.indexOf(t);
    expect(idx("The Avengers")).toBeGreaterThan(idx("Iron Man"));
    expect(idx("The Avengers")).toBeGreaterThan(idx("Captain America: The First Avenger"));
    expect(idx("Captain America: Civil War")).toBeGreaterThan(idx("The Avengers"));
    expect(idx("Avengers: Infinity War")).toBeGreaterThan(idx("Captain America: Civil War"));
    expect(idx("Avengers: Infinity War")).toBeGreaterThan(idx("Thor: Ragnarok"));
    expect(idx("Avengers: Endgame")).toBeGreaterThan(idx("Avengers: Infinity War"));

    expect(result.watchedCount).toBe(3);
    expect(result.totalCount).toBe(7);
    expect(result.remainingRuntime).toBe(607);
  });

  it("should detect circular dependency if Endgame is prerequisite of Iron Man", () => {
    const isCycle = wouldCreateCycle(movieMap, "iron-man", ["endgame"]);
    expect(isCycle).toBe(true);
  });

  it("should detect direct self-dependency", () => {
    const isCycle = wouldCreateCycle(movieMap, "iron-man", ["iron-man"]);
    expect(isCycle).toBe(true);
  });
});

describe("Feature 2: Knapsack Dynamic Programming", () => {
  it("should calculate [1, 3, 4] for group size 6 -> 2 bundles: 3 × 2", () => {
    const result = calculateFewestBundles([1, 3, 4], 6);
    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(2);
    expect(result.summary).toBe("2 bundles: 3 × 2");
  });

  it("should calculate [2, 5] for group size 11 -> 4 bundles: 5 × 1, 2 × 3", () => {
    const result = calculateFewestBundles([2, 5], 11);
    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(4);
    expect(result.summary).toBe("4 bundles: 5 × 1, 2 × 3");
  });

  it("should calculate [6, 9, 20] for group size 44 -> 4 bundles: 20 × 1, 9 × 2, 6 × 1", () => {
    const result = calculateFewestBundles([6, 9, 20], 44);
    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(4);
    expect(result.summary).toBe("4 bundles: 20 × 1, 9 × 2, 6 × 1");
  });

  it("should return Not possible for [4, 6] with group size 7", () => {
    const result = calculateFewestBundles([4, 6], 7);
    expect(result.possible).toBe(false);
    expect(result.totalBundles).toBe(0);
    expect(result.summary).toBe("Not possible");
  });
});