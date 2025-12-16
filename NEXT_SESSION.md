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
- **Filtres combinés** : Genre + statut sur pages `/books`, `/movies`, `/shows`
- **Temps total visionnage** : Stats sur `/stats` avec lecture estimée et visionnage réel
- **Mode surprise** : Bouton sur `/recommendations` pour 3 classiques modernes (livre/film/série)

**Bugs corrigés :**
- Items déjà dans bibliothèque/wishlist maintenant correctement marqués dans les résultats de recherche
- Modal ne montre plus "Sauvegardé" pour tous les items (state reset avec useEffect)
- Sauvegarder depuis modal met à jour la carte en dessous (callback vers parent)
- Progression et note des livres ne se sauvegardaient pas (API PATCH ne gérait que le status)
- Stats temps séries : stockage du runtime par épisode (migration 011)
- Stats temps livres : inclut maintenant les pages des livres en cours (`current_page`)
- Message IA surprise trop long : prompt modifié pour max 15-20 mots

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

## Priorité 3 - Nice to have (TERMINÉ PARTIELLEMENT)

### 3.1 Filtres combinés (TERMINÉ)
- [x] Genre + statut dans la bibliothèque
- **Implémenté :** Select genre + badges statut sur `/books`, `/movies`, `/shows`
- **Fichier utilitaire :** `src/lib/constants/genres.ts`

### 3.2 Temps total visionnage (TERMINÉ)
- [x] Stats séries/films + temps de lecture livres
- **Films :** Vraie durée via `movies.runtime` (stocké à l'ajout depuis TMDB)
- **Séries :** Runtime stocké par épisode dans `watched_episodes.runtime` (migration 011)
- **Livres :** Pages terminées + pages en cours (`current_page`) × 2 min/page
- **UI :** Section "Temps total" sur `/stats` avec total global
- **Fonctions :** `formatDuration()` et `formatLongDuration()` dans `lib/utils.ts`

### 3.3 Mode surprise (TERMINÉ)
- [x] Bouton sur la page `/recommendations`
- **API :** `/api/recommendations/surprise` (GET)
- **Gemini :** Génère 1 livre + 1 film + 1 série
- **Contraintes :** Classiques modernes (2010+), bien notés, basés sur goûts utilisateur
- **UI :** Card "Surprise" avec bouton Go, message IA + 3 recommandations

### 3.4 Graphique évolution/mois (À FAIRE)
- [ ] Visualisation des lectures/visionnages dans le temps
- **Période :** Configurable (année en cours, 12 derniers mois, custom)
- **Métriques multiples :**
  - Nombre de médias terminés
  - Temps passé (heures)
  - Pages lues (livres)
- **Graphiques :**
  - 1 graphique par type de média (livres, films, séries)
  - 1 graphique total combiné
- **Librairie suggérée :** recharts ou chart.js
- **Où :** Nouvelle page `/stats/charts` ou section dans `/stats`

### 3.5 Vue calendrier (COMPLEXE - À FAIRE PLUS TARD)
- [ ] Calendrier des lectures/visionnages
- **Logique des dates :**
  - Films : Date où on marque "Vu" (status = watched)
  - Livres : Date début (1ère page lue) + Date fin (status = read)
  - Séries : Date début (1er épisode vu) + Date fin (status = completed)
- **IMPORTANT :** Ne PAS afficher les médias importés en masse (avant l'app)
  - Solution : Ajouter colonne `imported_at` ou flag `is_imported`
  - Seuls les médias trackés "naturellement" apparaissent au calendrier
- **Librairie suggérée :** react-calendar ou custom grid
- **Où :** Nouvelle page `/stats/calendar`

---

## Priorité 4 - Optionnel

- [ ] Recherche par tropes (livres)
- [ ] Filtre note minimum (TMDB/utilisateur)
- [ ] Partager une recommandation
- [ ] Image "Currently reading/watching" pour réseaux sociaux
- [ ] **Prochaines sorties** - Alertes sur les nouveaux tomes des séries de livres en cours