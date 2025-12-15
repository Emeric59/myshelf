# Prompt pour reprendre le développement MyShelf

Copie-colle ce texte au début de ta prochaine session Claude Code :

---

## PROMPT À COPIER :

```
Lis le fichier PROGRESS.md pour comprendre l'état actuel du projet MyShelf, puis continue l'implémentation là où nous nous sommes arrêtés.

Tâches pour cette session (dans l'ordre) :

1. **Seed de données de test** : Ajouter des données fictives dans la DB locale pour pouvoir tester l'app (livres, films, séries avec différents statuts et notes)

2. **Highlights (passages favoris)** :
   - Créer le DB helper `src/lib/db/highlights.ts`
   - Créer l'API route `/api/highlights` (GET, POST, DELETE)
   - Créer le hook `useHighlights`
   - Connecter la page `/highlights` existante à l'API

3. **Import BookNode / TV Time** (si le temps le permet)

N'oublie pas de mettre à jour PROGRESS.md après chaque fonctionnalité terminée.
```

---

## Contexte technique pour la prochaine session

- Le build est OK
- Toutes les APIs existantes fonctionnent
- La table `highlights` existe déjà dans le schéma D1 (migration 001_initial.sql)
- Le type `Highlight` existe déjà dans `src/types/index.ts`
- La page `/highlights/page.tsx` existe avec du contenu statique placeholder

### Seed de données de test

Pour tester correctement l'app, il faudra créer un script ou une migration qui ajoute :
- 5-10 livres (mix de statuts : to_read, reading, read, avec notes variées)
- 5-10 films (mix de statuts : to_watch, watched, avec notes)
- 5-10 séries (mix de statuts : to_watch, watching, watched)
- Quelques reviews avec commentaires
- Quelques highlights pour les livres lus
- Des objectifs pour l'année en cours

Emplacement suggéré : `migrations/003_seed_test_data.sql`

---

## Améliorations futures à garder en tête

Ces suggestions ne sont pas urgentes mais à considérer avant le déploiement prod :

### 1. Tests unitaires
Ajouter des tests pour les DB helpers et les hooks avec Vitest ou Jest. Priorité : moyenne.

### 2. Validation Zod
Ajouter une validation des données entrantes sur les API routes avec Zod pour plus de robustesse et de meilleurs messages d'erreur.

```typescript
// Exemple pour /api/books POST
const BookInput = z.object({
  id: z.string(),
  status: z.enum(['to_read', 'reading', 'read', 'abandoned', 'blacklist']),
})
```

### 3. Error boundaries React
Ajouter des composants Error Boundary pour capturer les erreurs côté client et afficher un fallback propre au lieu d'un crash.

### 4. Skeleton loaders
Remplacer les spinners `<Loader2>` par des skeleton loaders pour une meilleure UX. Les cards "shimmer" pendant le chargement donnent une impression de rapidité.

### 5. Optimistic updates
Les hooks font déjà des refetch après mutation. On pourrait optimiser avec des updates optimistes (mettre à jour l'UI avant la réponse serveur).

### 6. Cache SWR ou React Query
Remplacer les hooks custom par SWR ou TanStack Query pour bénéficier du cache, revalidation, et deduplication automatiques.

---

## Rappel Git

Les fichiers suivants ne sont pas encore committés :
- `CLAUDE.md`
- `docs/`
- `PROGRESS.md`
- `NEXT_SESSION_PROMPT.md`

Penser à faire un commit avant de continuer !

---

Bonne prochaine session !
