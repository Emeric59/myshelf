# Prochaine session - Idées d'implémentation

## Amélioration du système de dismiss

### Exploiter les raisons de refus
Actuellement stockées mais non utilisées (`reason` dans `dismissed_media`).

**Idées :**
- Si "déjà vu/lu" → proposer d'ajouter à la bibliothèque au lieu de dismiss
- Analyser les patterns de refus pour affiner les recommandations :
  - Beaucoup de "pas intéressé" sur un genre → réduire ce genre dans les recos
  - Ajouter les raisons au contexte Gemini pour qu'il apprenne
- Page `/settings/dismissed` pour voir/gérer les médias refusés

### Simplification alternative
Si les raisons ne sont pas utiles → simplifier en dismiss direct (1 clic + confirmation simple sans choix de raison).

---

## Autres idées

### Recherche avancée
- Filtrer par genre en plus de l'année
- Filtrer par note minimum (TMDB/utilisateur)
- Recherche par tropes pour les livres

### Bibliothèque
- Filtres combinés (genre + statut)
- Vue calendrier des lectures/visionnages
- Export de la bibliothèque (CSV, JSON)

### Recommandations IA
- Historique des conversations avec l'IA
- Sauvegarder une recommandation pour plus tard (sans l'ajouter à la bibliothèque)
- Mode "surprise" - reco aléatoire basée sur les goûts

### Stats
- Graphique d'évolution des lectures/visionnages par mois
- Temps total passé à regarder des séries/films
- Streak de lecture (jours consécutifs)

### Social (optionnel, single-user mais...)
- Partager une recommandation
- Générer une image "Currently reading/watching" pour les réseaux sociaux
