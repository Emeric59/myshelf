# Prochaine session - Idées d'implémentation

## Dernière session (2025-12-16)

**Fait :**
- Fix recherche livres : debounce 500ms → 700ms
- Fix enrichissement Hardcover : fuzzy match avec Levenshtein (seuil 60%) au lieu de fallback aveugle `results[0]`
- Élimine les faux positifs comme "The Marine Corps Gazette" pour une recherche "Fourth Wing"

---

## Priorité 1 - Quick wins (implémentation rapide, UX immédiate)

- [ ] **Images dans les recos IA** - Ajouter image livre/film/série comme dans la recherche
- [ ] **Clic sur reco → fiche détail** - Navigation vers /books/[id], /movies/[id], /shows/[id]
- [ ] **Synopsis avant la note** - Corriger l'ordre d'affichage sur les fiches détail

---

## Priorité 2 - Fonctionnalités à valeur ajoutée

- [ ] **Liste "Mes envies"** - Sauvegarder une reco pour plus tard (sans l'ajouter à la bibliothèque)
- [ ] **Filtre par genre** - Sur recherche et recommandations IA
- [ ] **Export bibliothèque** - CSV et/ou JSON

---

## Priorité 3 - Nice to have

- [ ] **Mode surprise** - Reco aléatoire basée sur les goûts
- [ ] **Temps total visionnage** - Stats séries/films
- [ ] **Graphique évolution/mois** - Visualisation des lectures/visionnages
- [ ] **Filtres combinés** - Genre + statut dans la bibliothèque
- [ ] **Vue calendrier** - Lectures/visionnages par date

---

## Priorité 4 - Optionnel

- [ ] Recherche par tropes (livres)
- [ ] Filtre note minimum (TMDB/utilisateur)
- [ ] Partager une recommandation
- [ ] Image "Currently reading/watching" pour réseaux sociaux
