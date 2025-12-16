# Prochaine session - Idées d'implémentation

## Dernière session (2025-12-16)

**Fait :**
- **Graphiques d'évolution** : Nouvelle page `/stats/charts` avec recharts
- **API charts** : `/api/stats/charts` avec paramètres période, granularité
- **Sélecteurs multiples** : Période (année, 12 mois, custom), granularité (mois/semaine), métrique (count/time/pages)
- **Toggle graphique** : Basculer entre barres et lignes
- **Vue combinée** : Graphique avec livres/films/séries superposés
- **Graphiques individuels** : Un graphique par type de média
- **Lien depuis stats** : Card "Graphiques" ajoutée à `/stats`

**Session précédente :**
- Images dans les recommandations IA (enrichissement automatique via API)
- Modal de détail cliquable sur les recos IA (avec boutons Ajouter / Ne plus suggérer)
- Liste "Mes envies" : Table DB `wishlist`, API `/api/wishlist`, page `/wishlist`
- Filtres combinés : Genre + statut sur pages `/books`, `/movies`, `/shows`
- Temps total visionnage : Stats sur `/stats` avec lecture estimée et visionnage réel
- Mode surprise : Bouton sur `/recommendations` pour 3 classiques modernes (livre/film/série)

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

## Priorité 3 - Nice to have (QUASI TERMINÉ)

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

### 3.4 Graphique évolution/mois (TERMINÉ)
- [x] Visualisation des lectures/visionnages dans le temps
- **Période :** Configurable (année en cours, 12 derniers mois, année précédente, custom)
- **Granularité :** Par mois ou par semaine
- **Métriques multiples :**
  - Nombre de médias terminés
  - Temps passé (heures)
  - Pages lues (livres)
- **Graphiques :**
  - 1 graphique combiné (tous médias)
  - 1 graphique par type de média (livres, films, séries)
- **Toggle :** Basculer entre barres et lignes
- **Librairie :** recharts
- **Où :** Nouvelle page `/stats/charts` avec lien depuis `/stats`

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

### 3.6 Prochaines sorties (À FAIRE)
- [ ] Liste des prochaines sorties pour les séries qu'on suit
- **Cas d'usage :**
  - Nouveau tome d'une série de livres qu'on lit
  - Nouvelle saison d'une série TV qu'on regarde
  - Suite d'un film (si annoncée)
- **Sources de données :**
  - Livres : Hardcover API (série info) ou Google Books
  - Séries TV : TMDB API (`/tv/{id}` contient `next_episode_to_air`)
  - Films : TMDB API (collections, sequels annoncés)
- **UI possible :**
  - Section "À venir" sur le dashboard
  - Page dédiée `/upcoming` avec calendrier
  - Notifications (optionnel, plus complexe)
- **Données à stocker :**
  - Lien livre → série de livres (hardcover_series_id)
  - Date de sortie prévue (si connue)
- **Où :** Nouvelle page `/upcoming` ou section sur dashboard

---

## Priorité 4 - Optionnel

- [ ] Recherche par tropes (livres)
- [ ] Filtre note minimum (TMDB/utilisateur)
- [ ] Partager une recommandation
- [ ] Image "Currently reading/watching" pour réseaux sociaux