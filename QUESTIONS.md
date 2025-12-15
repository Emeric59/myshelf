# QUESTIONS.md — Questions en attente pour Emeric

> Ce fichier contient les questions qui nécessitent une réponse de l'utilisateur.
> Claude Code y ajoute des questions quand il est bloqué ou a besoin de clarification.

---

## Questions en attente

*(Aucune question pour le moment)*

---

## Actions en attente (non bloquantes)

### Migration 005 à appliquer

L'authentification Cloudflare a expiré pendant la session. La migration `005_add_descriptions.sql` (qui ajoute les descriptions/synopsis aux médias) n'a pas pu être appliquée.

**Action requise :**
```bash
wrangler login
wrangler d1 execute myshelf-db --file=./migrations/005_add_descriptions.sql --remote
```

Après l'application, les pages de détail afficheront les synopsis des livres, films et séries.

---

## Questions résolues

*(Historique des questions résolues)*
