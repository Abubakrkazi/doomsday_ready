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

export function calculateFewestBundles(
  bundleSizes: number[],
  groupSize: number
): BookingQuoteResult {
  if (groupSize <= 0) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      breakdown: [],
      summary: "Not possible",
    };
  }

  const uniqueSizes = Array.from(new Set(bundleSizes))
    .filter((s) => s > 0)
    .sort((a, b) => b - a);

  if (uniqueSizes.length === 0) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      breakdown: [],
      summary: "Not possible",
    };
  }

  const dp: number[] = new Array(groupSize + 1).fill(Infinity);
  const parent: number[] = new Array(groupSize + 1).fill(-1);

  dp[0] = 0;

  for (let s = 1; s <= groupSize; s++) {
    for (const size of uniqueSizes) {
      if (s >= size && dp[s - size] !== Infinity) {
        if (dp[s - size] + 1 < dp[s]) {
          dp[s] = dp[s - size] + 1;
          parent[s] = size;
        }
      }
    }
  }

  if (dp[groupSize] === Infinity) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      breakdown: [],
      summary: "Not possible",
    };
  }

  const counts = new Map<number, number>();
  let current = groupSize;

  while (current > 0) {
    const size = parent[current];
    if (size === -1) break;
    counts.set(size, (counts.get(size) || 0) + 1);
    current -= size;
  }

  const breakdown: BundleBreakdown[] = Array.from(counts.entries())
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.size - a.size);

  const totalBundles = dp[groupSize];
  const parts = breakdown.map((b) => `${b.size} × ${b.count}`);
  const summary = `${totalBundles} bundle${totalBundles > 1 ? "s" : ""}: ${parts.join(", ")}`;

  return {
    possible: true,
    groupSize,
    totalBundles,
    breakdown,
    summary,
  };
}