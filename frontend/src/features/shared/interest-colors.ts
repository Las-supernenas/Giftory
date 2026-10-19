export const INTEREST_COLOR_STYLES = {
  lavender: "bg-accent-lavender/20 text-primary",
  pink: "bg-accent-dusty-pink/20 text-primary",
  navy: "bg-primary/10 text-primary",
  neutral: "bg-muted/10 text-foreground",
  gold: "bg-accent-gold/20 text-primary",
  nature: "bg-accent-nature/15 text-primary",
} as const;

const INTEREST_COLORS: Record<string, keyof typeof INTEREST_COLOR_STYLES> = {
  // Technology, science, and games
  TECHNOLOGY: "navy",
  GAMING: "navy",
  SCIENCE: "navy",
  BOARD_GAMES_AND_PUZZLES: "navy",

  // Reading, learning, travel, and culture
  BOOKS_AND_READING: "lavender",
  HISTORY: "lavender",
  LANGUAGES: "lavender",
  EDUCATION: "lavender",
  TRAVEL: "lavender",
  ADVENTURE: "lavender",
  CULTURAL_EXPERIENCES: "lavender",

  // Arts, music, creativity, and beauty
  PHOTOGRAPHY: "pink",
  FILM_AND_TV: "pink",
  MUSIC: "pink",
  ART_AND_DESIGN: "pink",
  CRAFTS_AND_DIY: "pink",
  WRITING: "pink",
  FASHION: "pink",
  BEAUTY_AND_SKINCARE: "pink",

  // Food and drinks
  COOKING: "gold",
  BAKING: "gold",
  FOOD_AND_GASTRONOMY: "gold",
  COFFEE_AND_TEA: "gold",

  // Nature and animals
  GARDENING: "nature",
  NATURE_AND_WILDLIFE: "nature",
  PETS: "nature",
  SUSTAINABILITY: "nature",

  // Sports, wellbeing, and other interests
  FITNESS: "neutral",
  OUTDOOR_SPORTS: "neutral",
  TEAM_SPORTS: "neutral",
  WELLNESS_AND_SELF_CARE: "neutral",
  YOGA_AND_MEDITATION: "neutral",
  HOME_AND_DECOR: "neutral",
  COLLECTIBLES: "neutral",
  CARS_AND_MOTORSPORTS: "neutral",
};

export function getInterestColorStyle(interest: string): string {
  const color = INTEREST_COLORS[interest] ?? "neutral";
  return INTEREST_COLOR_STYLES[color];
}

const INTEREST_ACCENT_COLORS = {
  lavender: "var(--color-accent-lavender)",
  pink: "var(--color-accent-dusty-pink)",
  navy: "var(--color-primary)",
  neutral: "var(--color-muted)",
  gold: "var(--color-accent-gold)",
  nature: "var(--color-accent-nature)",
} as const;

export function getInterestAccentColor(interest: string): string {
  return INTEREST_ACCENT_COLORS[INTEREST_COLORS[interest] ?? "neutral"];
}
