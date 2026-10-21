// normalize written text (lowercase, trimmed and without accents)
// used by every client-side search (Discovery, Library, People)
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
