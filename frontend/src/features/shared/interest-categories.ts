//Presentation groups for the interest filters (Discovery and library)
//Same groups as the comments of the interes enum in backend/prisma/schema.prisma
//the options always come from the loaded data
// it only says how to group them. An interest not listed here is shown under "Otros"

export type InterestCategory = {
  label: string;
  interests: string[];
};

const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    label: "Tecnología y entretenimiento",
    interests: ["TECHNOLOGY", "GAMING", "PHOTOGRAPHY", "FILM_AND_TV", "MUSIC"],
  },
  {
    label: "Lectura y aprendizaje",
    interests: [
      "BOOKS_AND_READING",
      "SCIENCE",
      "HISTORY",
      "LANGUAGES",
      "EDUCATION",
    ],
  },
  {
    label: "Arte y creatividad",
    interests: ["ART_AND_DESIGN", "CRAFTS_AND_DIY", "WRITING", "FASHION"],
  },
  {
    label: "Deporte y bienestar",
    interests: [
      "FITNESS",
      "OUTDOOR_SPORTS",
      "TEAM_SPORTS",
      "WELLNESS_AND_SELF_CARE",
      "YOGA_AND_MEDITATION",
    ],
  },
  {
    label: "Comida y bebida",
    interests: ["COOKING", "BAKING", "FOOD_AND_GASTRONOMY", "COFFEE_AND_TEA"],
  },
  {
    label: "Naturaleza y animales",
    interests: ["GARDENING", "NATURE_AND_WILDLIFE", "PETS", "SUSTAINABILITY"],
  },
  {
    label: "Viajes y experiencias",
    interests: ["TRAVEL", "ADVENTURE", "CULTURAL_EXPERIENCES"],
  },
  {
    label: "Estilo de vida y colección",
    interests: [
      "HOME_AND_DECOR",
      "BEAUTY_AND_SKINCARE",
      "COLLECTIBLES",
      "CARS_AND_MOTORSPORTS",
      "BOARD_GAMES_AND_PUZZLES",
    ],
  },
];

const OTHER_CATEGORY_LABEL = "Otros";

// Groups the given interests by category. Every category is returned, even with no interests,
// so the user always sees the full structure. "Otros" only appears when it has interests
export function groupInterestsByCategory(
  interests: string[],
): InterestCategory[] {
  const groups = INTEREST_CATEGORIES.map((category) => ({
    label: category.label,
    interests: category.interests.filter((interest) =>
      interests.includes(interest),
    ),
  }));

  const groupedInterests = INTEREST_CATEGORIES.flatMap(
    (category) => category.interests,
  );
  const otherInterests = interests.filter(
    (interest) => !groupedInterests.includes(interest),
  );

  if (otherInterests.length === 0) {
    return groups;
  }

  return [
    ...groups,
    { label: OTHER_CATEGORY_LABEL, interests: otherInterests },
  ];
}
