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

### 3.8 Scalabilité IA pour grandes bibliothèques (IMPORTANT - À FAIRE)
- [ ] Optimiser les recommandations IA pour bibliothèques 100+ médias

**Contexte :**
L'app est destinée à quelqu'un qui a vu ÉNORMÉMENT de films et séries. Les limites actuelles du code vont poser problème.

**Limites actuelles du code (`src/lib/ai/gemini.ts`) :**

```typescript
// Ligne 80-96 : Seulement les 10 meilleurs médias envoyés
const topBooks = context.readBooks
  .filter(b => b.rating && b.rating >= 4)
  .slice(0, 10)  // ⚠️ Limité à 10

// Ligne 125 : Seulement 50 titres exclus
context.excludedTitles.slice(0, 50)  // ⚠️ Limité à 50
```

**Problèmes avec une grande bibliothèque :**

| Scénario | Problème |
|----------|----------|
| 500 films vus | Gemini ne connaît que 10 favoris (2%) |
| 500 films vus | 450 films peuvent être re-recommandés (doublons) |
| Goûts variés | Les 10 top ne représentent pas la diversité |
| Beaucoup de 5★ | Sélection arbitraire des "meilleurs" |

**Impact concret :**
- "Je t'ai déjà recommandé Inception ?" → OUI, car pas dans les 50 exclus
- Recommandations qui ne reflètent pas tous les goûts
- Frustration utilisateur

---

#### Solutions proposées (par ordre de complexité)

##### Option 1 : Augmenter les limites (FACILE - Court terme)

**Effort :** 5 minutes
**Fichier :** `src/lib/ai/gemini.ts`

```typescript
// Avant
.slice(0, 10)  // top médias
context.excludedTitles.slice(0, 50)

// Après
.slice(0, 25)  // top médias (lignes 83, 89, 95)
context.excludedTitles.slice(0, 200)  // ligne 125
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Immédiat | ❌ Consomme plus de tokens |
| ✅ Aucun risque | ❌ Ne scale pas à 1000+ médias |
| ✅ Meilleure couverture | ❌ Prompt plus long = latence |

**Estimation tokens :**
- Actuel : ~2000-3000 tokens/requête
- Avec limites augmentées : ~4000-6000 tokens/requête
- Limite Gemini : 1 million tokens (largement OK)

**Recommandation :** Faire ça EN PREMIER, c'est gratuit et rapide.

---

##### Option 2 : Résumé statistique intelligent (MOYEN - Moyen terme)

**Effort :** 2-3 heures
**Fichiers :** `src/lib/ai/gemini.ts`, nouvelles fonctions utilitaires

**Concept :** Au lieu d'envoyer des listes de titres, envoyer un PROFIL statistique.

**Exemple de prompt généré :**

```
PROFIL CINÉMATOGRAPHIQUE DE L'UTILISATEUR :

📊 Volume : 487 films vus, 89 séries terminées, 156 livres lus

🎬 Films (487 vus) :
- Genres dominants : Thriller (28%), Action (22%), SF (18%), Drame (15%)
- Décennies préférées : 2010s (45%), 2000s (30%), 2020s (15%)
- Note moyenne donnée : 3.6/5
- Réalisateurs récurrents : Nolan (8), Villeneuve (6), Fincher (5)
- Films 5★ récents : Oppenheimer, Dune 2, Everything Everywhere

📺 Séries (89 terminées) :
- Genres dominants : Drama (40%), Thriller (25%), Comedy (20%)
- Durée moyenne préférée : 3-5 saisons
- Plateformes : Netflix (45%), HBO (30%), Apple TV+ (15%)
- Séries 5★ : Breaking Bad, The Bear, Severance

📚 Livres (156 lus) :
- Genres : Fantasy (35%), Romance (30%), Thriller (20%)
- Auteurs favoris : Sarah J. Maas (12), Colleen Hoover (8)
- Tropes adorés : Found Family, Enemies to Lovers, Morally Grey
```

**Implémentation :**

```typescript
// Nouvelle fonction dans gemini.ts
function buildStatisticalProfile(context: UserContext): string {
  const movieGenres = countGenres(context.watchedMovies)
  const topDirectors = findRecurringCreators(context.watchedMovies)
  const decadeDistribution = analyzeDecades(context.watchedMovies)
  const avgRating = calculateAverageRating(context.watchedMovies)

  return `
    📊 Volume : ${context.watchedMovies.length} films vus
    🎬 Genres : ${formatPercentages(movieGenres)}
    📅 Décennies : ${formatPercentages(decadeDistribution)}
    ⭐ Note moyenne : ${avgRating}/5
    🎥 Réalisateurs récurrents : ${topDirectors.join(', ')}
  `
}
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Scale à l'infini | ❌ Perd les titres spécifiques |
| ✅ Prompt compact | ❌ Nécessite stockage créateurs/décennies |
| ✅ Meilleure vue d'ensemble | ❌ 2-3h de dev |
| ✅ Moins de tokens | |

**Données additionnelles à stocker (migration DB) :**
- `movies.director` : Réalisateur principal
- `movies.release_year` : Année (extraite de release_date)
- `books.author` : Déjà présent ✅

---

##### Option 3 : Vérification post-génération (FACILE - Complémentaire)

**Effort :** 30 minutes
**Fichier :** `src/lib/ai/gemini.ts` ou routes API

**Concept :** Laisser Gemini recommander librement, puis vérifier en DB si les titres existent déjà.

**Implémentation :**

```typescript
// Dans getRecommendations(), après parsing JSON
const validRecommendations = await filterExistingMedia(
  parsed.recommendations,
  db  // Passer la connexion D1
)

async function filterExistingMedia(recos: Recommendation[], db: D1Database) {
  const validRecos = []

  for (const reco of recos) {
    const exists = await checkIfInLibrary(db, reco.title, reco.type)
    if (!exists) {
      validRecos.push(reco)
    } else {
      console.log(`[Filter] "${reco.title}" déjà dans la bibliothèque, ignoré`)
    }
  }

  return validRecos
}
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Garantit 0 doublon | ❌ Peut réduire le nombre de recos |
| ✅ Simple à implémenter | ❌ Requêtes DB supplémentaires |
| ✅ Complémentaire aux autres options | ❌ Gemini "gaspille" des suggestions |

**Amélioration possible :** Demander plus de recos à Gemini (8-10) pour compenser le filtrage.

---

##### Option 4 : Embeddings avec Cloudflare Vectorize (AVANCÉ - Long terme)

**Effort :** 1-2 jours
**Fichiers :** Nouveau système complet

**Concept :** Utiliser des vecteurs sémantiques pour représenter les goûts, sans lister de titres.

**Architecture :**

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTÈME ACTUEL                           │
│  User → "Je veux un thriller" → Gemini (avec liste titres)  │
└─────────────────────────────────────────────────────────────┘

                           ↓ Migration vers ↓

┌─────────────────────────────────────────────────────────────┐
│                  SYSTÈME AVEC VECTORIZE                      │
│                                                              │
│  1. Chaque média vu → Embedding (vecteur 1536 dimensions)   │
│  2. Profil utilisateur = moyenne des embeddings             │
│  3. Gemini génère des recos                                  │
│  4. Chaque reco → Embedding                                  │
│  5. Comparaison vectorielle : "Déjà vu quelque chose de     │
│     similaire ?" (cosine similarity > 0.95 = probablement   │
│     le même film ou très proche)                             │
└─────────────────────────────────────────────────────────────┘
```

**Avantages Vectorize :**
- Scale à 100 000+ médias sans problème
- Détecte les doublons même avec titres différents (VF vs VO)
- Peut trouver des "trop similaires" (pas juste les doublons exacts)
- Recommandations sémantiques : "Films PROCHES de ce que tu aimes"

**Implémentation haut niveau :**

```typescript
// 1. À l'ajout d'un média, créer son embedding
async function onMediaAdded(media: Movie) {
  const embedding = await generateEmbedding(
    `${media.title} ${media.genres} ${media.director} ${media.year}`
  )
  await vectorize.insert({
    id: media.id,
    vector: embedding,
    metadata: { type: 'movie', title: media.title }
  })
}

// 2. Pour les recos, chercher si "déjà vu quelque chose de similaire"
async function isAlreadyWatched(recoTitle: string): Promise<boolean> {
  const recoEmbedding = await generateEmbedding(recoTitle)
  const similar = await vectorize.query(recoEmbedding, { topK: 1 })

  return similar[0]?.score > 0.92  // Très similaire = probablement vu
}
```

**Coût Cloudflare Vectorize :**
- Free tier : 5 millions de vecteurs stockés, 30 millions requêtes/mois
- Largement suffisant

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Scale infini | ❌ Complexe à implémenter |
| ✅ Détection sémantique | ❌ Nécessite API embeddings (OpenAI/Voyage) |
| ✅ Recommandations intelligentes | ❌ 1-2 jours de travail |
| ✅ Futur-proof | ❌ Coût API embeddings (~$0.0001/embedding) |

---

#### Plan d'action recommandé

| Phase | Action | Effort | Quand |
|-------|--------|--------|-------|
| **1** | Augmenter limites (10→25, 50→200) | 5 min | Immédiat |
| **2** | Vérification post-génération en DB | 30 min | Dès que doublons apparaissent |
| **3** | Résumé statistique (genres, décennies) | 2-3h | Quand bibliothèque > 200 médias |
| **4** | Vectorize (embeddings sémantiques) | 1-2 jours | Quand bibliothèque > 500 médias |

---

#### Métriques à surveiller

Pour savoir quand passer à la phase suivante :

```sql
-- Nombre de médias par type
SELECT
  (SELECT COUNT(*) FROM user_books) as books,
  (SELECT COUNT(*) FROM user_movies) as movies,
  (SELECT COUNT(*) FROM user_shows) as shows;

-- Si movies > 100 → Phase 1
-- Si movies > 200 → Phase 2-3
-- Si movies > 500 → Phase 4
```

---

## Priorité 4 - Optionnel

- [ ] Recherche par tropes (livres)
- [ ] Filtre note minimum (TMDB/utilisateur)
- [ ] Partager une recommandation
- [ ] Image "Currently reading/watching" pour réseaux sociaux