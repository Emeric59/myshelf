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
- **Images dans suggestions par mood** : Refactorisé `/recommendations` pour utiliser `RecommendationCard`
- **Liste "Mes envies"** : Table DB `wishlist`, API `/api/wishlist`, page `/wishlist`
- **Bouton wishlist sur recherche** : Cœur sur chaque MediaCard + bouton "Mes envies" dans le modal
- **Filtre par genre** : Recherche, recos mood, chat IA
- **Fix statut recherche** : API `/api/search` vérifie maintenant `in_library` et `in_wishlist` via DB
- **Fix modal state** : Reset du state quand on change d'item + callback `onWishlistAdd` pour sync parent

**Bugs corrigés :**
- Items déjà dans bibliothèque/wishlist maintenant correctement marqués dans les résultats de recherche
- Modal ne montre plus "Sauvegardé" pour tous les items (state reset avec useEffect)
- Sauvegarder depuis modal met à jour la carte en dessous (callback vers parent)

---

## Priorité 1 - Quick wins (TERMINÉ)

- [x] **Images dans les recos IA** - Ajouter image livre/film/série comme dans la recherche
- [x] **Clic sur reco → fiche détail** - Modal de détail avec synopsis, genres, tropes, etc.
- [x] **Synopsis avant la note** - Après progression, avant note/avis

---

## Priorité 2 - Fonctionnalités à valeur ajoutée (TERMINÉ)

- [x] **Liste "Mes envies"** - Sauvegarder une reco pour plus tard (sans l'ajouter à la bibliothèque)
- [x] **Filtre par genre** - Sur recherche et recommandations IA

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
