//Interests as Person (or a GiftIdea) can have.
//must match the Interest enum in prisma/schema.prisma
//it wont compile if they get out of sync.

export const INTERESTS = [
  'TECHNOLOGY',
  'GAMING',
  'PHOTOGRAPHY',
  'FILM_AND_TV',
  'MUSIC',
  'BOOKS_AND_READING',
  'SCIENCE',
  'HISTORY',
  'LANGUAGES',
  'EDUCATION',
  'ART_AND_DESIGN',
  'CRAFTS_AND_DIY',
  'WRITING',
  'FASHION',
  'FITNESS',
  'OUTDOOR_SPORTS',
  'TEAM_SPORTS',
  'WELLNESS_AND_SELF_CARE',
  'YOGA_AND_MEDITATION',
  'COOKING',
  'BAKING',
  'FOOD_AND_GASTRONOMY',
  'COFFEE_AND_TEA',
  'GARDENING',
  'NATURE_AND_WILDLIFE',
  'PETS',
  'SUSTAINABILITY',
  'TRAVEL',
  'ADVENTURE',
  'CULTURAL_EXPERIENCES',
  'HOME_AND_DECOR',
  'BEAUTY_AND_SKINCARE',
  'COLLECTIBLES',
  'CARS_AND_MOTORSPORTS',
  'BOARD_GAMES_AND_PUZZLES',
] as const;

export type Interest = (typeof INTERESTS)[number];
