// Spanish labels for the interests.
// The list of available interests comes from the backend (GET /api/interests).
// If an interest has no label here, the UI shows its key instead.

export const INTEREST_LABELS: Record<string, string> = {
  TECHNOLOGY: "Tecnología",
  GAMING: "Videojuegos",
  PHOTOGRAPHY: "Fotografía",
  FILM_AND_TV: "Cine y series",
  MUSIC: "Música",
  BOOKS_AND_READING: "Libros y lectura",
  SCIENCE: "Ciencia",
  HISTORY: "Historia",
  LANGUAGES: "Idiomas",
  EDUCATION: "Educación",
  ART_AND_DESIGN: "Arte y diseño",
  CRAFTS_AND_DIY: "Manualidades",
  WRITING: "Escritura",
  FASHION: "Moda",
  FITNESS: "Fitness",
  OUTDOOR_SPORTS: "Deportes al aire libre",
  TEAM_SPORTS: "Deportes de equipo",
  WELLNESS_AND_SELF_CARE: "Bienestar y autocuidado",
  YOGA_AND_MEDITATION: "Yoga y meditación",
  COOKING: "Cocina",
  BAKING: "Repostería",
  FOOD_AND_GASTRONOMY: "Gastronomía",
  COFFEE_AND_TEA: "Café y té",
  GARDENING: "Jardinería",
  NATURE_AND_WILDLIFE: "Naturaleza y fauna",
  PETS: "Mascotas",
  SUSTAINABILITY: "Sostenibilidad",
  TRAVEL: "Viajes",
  ADVENTURE: "Aventura",
  CULTURAL_EXPERIENCES: "Experiencias culturales",
  HOME_AND_DECOR: "Hogar y decoración",
  BEAUTY_AND_SKINCARE: "Belleza y cuidado de la piel",
  COLLECTIBLES: "Coleccionismo",
  CARS_AND_MOTORSPORTS: "Coches y motor",
  BOARD_GAMES_AND_PUZZLES: "Juegos de mesa y puzles",
};

// An interest key as the backend returns it (example: "TECHNOLOGY")
export type Interest = string;

// A person as the backend returns it
export type Person = {
  id: number;
  name: string;
  interests: Interest[];
  savedIdeasCount: number;
};

// Data we send to create or edit a person
export type PersonInput = {
  name: string;
  interests: Interest[];
};
