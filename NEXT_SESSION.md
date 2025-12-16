# Prochaine session - Idées d'implémentation

## Dernière session (2025-12-17)

**Fait :**

### Fonctionnalité "Prochaines sorties"
- **Page `/upcoming`** : Liste des prochains épisodes groupés par mois
- **API `/api/upcoming`** : GET (liste) et POST (refresh) des prochaines sorties TMDB
- **Migration DB 012** : Colonnes `next_episode_air_date`, `next_episode_season`, `next_episode_number`, `next_episode_name`, `upcoming_updated_at`
- **Section dashboard** : Aperçu des 3 prochaines sorties sur la page d'accueil
- **UI colorée** : Bordure verte (aujourd'hui), orange (dans 3 jours)
- **Rafraîchissement intelligent** : Max 5 séries par requête pour éviter timeout

### Migration OpenNext (Infrastructure majeure)
- **Problème résolu** : Bundle `@cloudflare/next-on-pages` dépassait 3 MiB (limite free tier)
- **Nouveau package** : `@opennextjs/cloudflare` (meilleur code splitting)
- **Migration imports** : `getRequestContext` → `getCloudflareContext` (17 fichiers API)
- **Suppression runtime** : Plus besoin de `export const runtime = "edge"` (20 fichiers)
- **Nouvelle config** : `wrangler.jsonc` (remplace `.toml`) + `open-next.config.ts`
- **GitHub Actions** : Nouveau workflow de déploiement automatique
- **Secrets configurés** : TMDB_API_KEY, GEMINI_API_KEY, HARDCOVER_API_KEY, GOOGLE_BOOKS_API_KEY
- **Fix images** : Ajout domaines Google Books dans `remotePatterns`
- **Nouvelle URL** : https://myshelf.emericb59.workers.dev

**Session précédente (2025-12-16) :**
- Graphiques d'évolution : Nouvelle page `/stats/charts` avec recharts
- API charts : `/api/stats/charts` avec paramètres période, granularité
- Toggle graphique : Basculer entre barres et lignes
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

### 3.6 Prochaines sorties (TERMINÉ - MVP Séries TV)
- [x] Liste des prochaines sorties pour les séries qu'on suit
- **Implémenté :**
  - Page `/upcoming` avec liste des prochains épisodes groupés par mois
  - API `/api/upcoming` avec rafraîchissement intelligent (max 5 séries/requête)
  - Section "À venir" sur le dashboard avec aperçu des 3 prochaines sorties
  - Migration DB : `next_episode_air_date`, `next_episode_season`, `next_episode_number`, `next_episode_name`
  - UI avec codes couleur : vert (aujourd'hui), orange (imminent), normal (plus tard)
  - Bouton refresh manuel
- **Sources de données utilisées :**
  - Séries TV : TMDB API (`/tv/{id}` → `next_episode_to_air`)
- **À faire plus tard (extensions possibles) :**
  - Livres : Intégrer Hardcover API pour les prochains tomes de séries
  - Films : Vérifier les collections TMDB pour les suites annoncées

### 3.7 Mise à jour automatique des nouvelles saisons (À FAIRE)
- [ ] Synchronisation automatique quand une nouvelle saison sort

**Problème actuel :**
Quand une série dans la bibliothèque reçoit une nouvelle saison sur TMDB :
- La série reste affichée comme "100% vue" alors qu'une nouvelle saison existe
- Les nouvelles saisons/épisodes ne sont pas ajoutés à la fiche
- L'utilisateur doit manuellement "resynchroniser" la série

**Comportement attendu :**
1. **Détection** : Vérifier périodiquement si `seasons_count` ou `episodes_count` a changé sur TMDB
2. **Mise à jour des métadonnées** :
   - Récupérer les nouvelles saisons depuis TMDB (`/tv/{id}`)
   - Insérer les nouveaux épisodes dans `show_seasons`
   - Mettre à jour `total_seasons` et `total_episodes` dans `shows`
3. **Recalcul de la progression** :
   - La progression passe de 100% à X% (épisodes vus / nouveau total)
   - Le statut peut repasser de "Terminée" à "En cours" si nouvelle saison
4. **Préserver les données utilisateur** :
   - Note (rating) : CONSERVER
   - Avis (review) : CONSERVER
   - Épisodes cochés (watched_episodes) : CONSERVER
   - Statut : RECALCULER (si était "Terminée" et nouvelle saison → "En cours")

**Implémentation suggérée :**

```
Option A : Refresh lors de la visite de la fiche
- Quand on ouvre /shows/[id], comparer seasons_count DB vs TMDB
- Si différent → proposer un bouton "Mettre à jour" ou auto-refresh
- Avantage : Simple, pas de job background
- Inconvénient : L'utilisateur doit visiter la fiche

Option B : Job périodique via /api/upcoming
- Profiter du refresh des "prochaines sorties" pour vérifier les nouvelles saisons
- Si next_episode_to_air est null ET dernière vérif > 7 jours → check TMDB
- Avantage : Automatique
- Inconvénient : Plus complexe, risque de rate limit TMDB

Option C : Bouton "Sync bibliothèque" manuel
- Bouton dans /settings ou /shows pour forcer la synchro de toutes les séries
- Avantage : Contrôle utilisateur, pas de surprises
- Inconvénient : Manuel
```

**Données à stocker (nouvelle colonne possible) :**
- `shows.tmdb_seasons_count` : Nombre de saisons selon TMDB (pour détecter les changements)
- `shows.last_tmdb_sync` : Date du dernier refresh TMDB complet

**API concernées :**
- `GET /api/shows?id=xxx` : Ajouter logique de détection de changement
- Nouvelle route `POST /api/shows/sync` : Forcer la synchronisation d'une série
- Ou intégrer dans `/api/upcoming` existant

**UI :**
- Badge "Nouvelle saison disponible" sur la card de la série
- Notification sur le dashboard si des séries ont de nouvelles saisons
- Bouton "Synchroniser" sur la fiche série

---

## Priorité 4 - Optionnel

- [ ] Recherche par tropes (livres)
- [ ] Filtre note minimum (TMDB/utilisateur)
- [ ] Partager une recommandation
- [ ] Image "Currently reading/watching" pour réseaux sociaux