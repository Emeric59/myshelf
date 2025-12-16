# Prochaine session - Idées d'implémentation

## Dernière session (2025-12-16)

**Fait :**
- Images dans les recommandations IA (enrichissement automatique via API)
- Modal de détail cliquable sur les recos IA (avec boutons Ajouter / Ne plus suggérer)
- Fermeture automatique du modal après ajout à la bibliothèque
- Synopsis déplacé après progression, avant note/avis sur les fiches détail
- Nettoyage HTML dans les synopsis (balises `<br>`, `<i>`, `<b>`, entités HTML)
- Auto-mark tous les épisodes vus quand série = "Terminée"
- Nouveau composant `RecommendationCard` pour les recos IA
- Fonction utilitaire `stripHtml()` dans `lib/utils.ts`

---

## Priorité 1 - Quick wins (TERMINÉ)

- [x] **Images dans les recos IA** - Ajouter image livre/film/série comme dans la recherche
- [x] **Clic sur reco → fiche détail** - Modal de détail avec synopsis, genres, tropes, etc.
- [x] **Synopsis avant la note** - Après progression, avant note/avis

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
