export type Tier = "common" | "uncommon" | "rare" | "veryrare" | "legendary";

export interface CaseItem {
  name: string;
  icon: string;
  tier: Tier;
  chance: number; // percentage points, all items should sum to 100
  flavor: string;
}

export const TIER_COLOR: Record<Tier, string> = {
  common: "#b8c4db",
  uncommon: "#4f8fe8",
  rare: "#7c5cff",
  veryrare: "#e8478b",
  legendary: "#ffc94a",
};

export const TIER_LABEL: Record<Tier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  veryrare: "Very Rare",
  legendary: "Legendary",
};

export const CASE_ITEMS: CaseItem[] = [
  { name: "Sunny", icon: "☀️", tier: "common", chance: 28, flavor: "A clean, cloudless pull. Nothing beats a clear sky." },
  { name: "Partly Cloudy", icon: "⛅", tier: "common", chance: 24, flavor: "A few clouds drifting through. Comfortably average." },
  { name: "Cloudy", icon: "☁️", tier: "common", chance: 20, flavor: "Full overcast. The sky keeps its cards close." },
  { name: "Foggy", icon: "🌫️", tier: "uncommon", chance: 13, flavor: "Visibility drops. A quietly atmospheric pull." },
  { name: "Windy", icon: "🍃", tier: "uncommon", chance: 9, flavor: "Everything is moving. Hold onto your umbrella." },
  { name: "Rain", icon: "🌧️", tier: "rare", chance: 4, flavor: "A proper rare drop — steady rainfall." },
  { name: "Thunderstorm", icon: "⛈️", tier: "veryrare", chance: 1.7, flavor: "Lightning included. A genuinely rare pull." },
  { name: "Snow", icon: "❄️", tier: "legendary", chance: 0.3, flavor: "LEGENDARY. The rarest condition in the case." },
];

export function weightedPick(): CaseItem {
  const total = CASE_ITEMS.reduce((sum, item) => sum + item.chance, 0);
  let r = Math.random() * total;
  for (const item of CASE_ITEMS) {
    if (r < item.chance) return item;
    r -= item.chance;
  }
  return CASE_ITEMS[0];
}