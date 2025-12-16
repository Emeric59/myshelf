/**
 * Liste des genres communs pour les filtres de bibliothèque
 */

export const genreOptions = [
  { value: "", label: "Tous les genres" },
  { value: "romance", label: "Romance" },
  { value: "fantasy", label: "Fantasy" },
  { value: "science-fiction", label: "Science-Fiction" },
  { value: "thriller", label: "Thriller" },
  { value: "horror", label: "Horreur" },
  { value: "comedy", label: "Comédie" },
  { value: "drama", label: "Drame" },
  { value: "action", label: "Action" },
  { value: "adventure", label: "Aventure" },
  { value: "mystery", label: "Mystère" },
  { value: "crime", label: "Policier" },
  { value: "historical", label: "Historique" },
]

/**
 * Filtre un tableau de médias par genre
 * Comparaison insensible à la casse et par inclusion partielle
 */
export function filterByGenre<T extends { genres?: string[] }>(
  items: T[],
  genreFilter: string
): T[] {
  if (!genreFilter) return items
  return items.filter((item) => {
    const genres = item.genres || []
    return genres.some((g) => {
      const genreStr = typeof g === "string" ? g : (g as { tag?: string }).tag || ""
      return genreStr.toLowerCase().includes(genreFilter.toLowerCase())
    })
  })
}
