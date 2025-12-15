# MyShelf — Spécifications fonctionnelles complètes

> Application personnelle de suivi et recommandation de médias (livres, films, séries)
> Single-user - PWA - Vibes whimsical violet/vert/nature

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Bibliothèque & Tracking](#2-bibliothèque--tracking)
3. [Recherche & Ajout de médias](#3-recherche--ajout-de-médias)
4. [Système de notation & avis](#4-système-de-notation--avis)
5. [Passages favoris & annotations](#5-passages-favoris--annotations)
6. [Système de tropes](#6-système-de-tropes)
7. [Recommandations IA](#7-recommandations-ia)
8. [Gestion des abonnements streaming](#8-gestion-des-abonnements-streaming)
9. [Dashboard & accueil](#9-dashboard--accueil)
10. [Statistiques & objectifs](#10-statistiques--objectifs)
11. [Import de données](#11-import-de-données)
12. [Paramètres](#12-paramètres)
13. [Design & UX](#13-design--ux)
14. [Écrans détaillés](#14-écrans-détaillés)

---

## 1. Vision produit

### 1.1 Problème résolu

Les applications existantes (BookNode, TV Time, Goodreads, Sens Critique) sont :
- Fragmentées (une app par type de média)
- Sociales par défaut (pas besoin de partager)
- Limitées en personnalisation des recommandations
- Incapables de comprendre *pourquoi* on a aimé quelque chose

### 1.2 Solution MyShelf

Une application **tout-en-un** qui :
- Centralise livres, films et séries au même endroit
- Offre des recommandations IA **vraiment personnalisées** basées sur le ressenti
- Permet un tracking fin (avancement, re-lectures, abandons)
- Reste 100% privée et personnelle

### 1.3 Utilisatrice cible

- Grande lectrice (romance, fantasy, romantasy)
- Consomme aussi films et séries
- Veut des recommandations pertinentes, pas génériques
- A des "tropes" qu'elle adore et d'autres qu'elle déteste
- Lit en français ET en anglais

---

## 2. Bibliothèque & Tracking

### 2.1 Types de médias supportés

| Type | Spécificités |
|------|--------------|
| **Livres** | Pages, chapitres, séries/sagas, langue (FR/EN) |
| **Films** | Durée, où regarder (streaming) |
| **Séries** | Saisons, épisodes, statut (en cours/terminée/annulée) |

### 2.2 Statuts possibles

#### Livres
| Statut | Description |
|--------|-------------|
| À lire | Dans la wishlist, pas commencé |
| En cours | Lecture en cours |
| Lu | Terminé |
| Abandonné | Arrêté avant la fin |
| Blacklist | Ne jamais suggérer |

#### Films
| Statut | Description |
|--------|-------------|
| À voir | Dans la watchlist |
| Vu | Regardé |
| Blacklist | Ne jamais suggérer |

#### Séries
| Statut | Description |
|--------|-------------|
| À voir | Dans la watchlist |
| En cours | Visionnage en cours |
| Terminée | Tous les épisodes vus |
| Abandonnée | Arrêtée avant la fin |
| En pause | Mise de côté temporairement |
| Blacklist | Ne jamais suggérer |

### 2.3 Données de tracking

#### Pour les livres
- Date de début de lecture
- Date de fin de lecture
- Page actuelle / nombre total de pages
- Pourcentage d'avancement (calculé)
- Nombre de re-lectures

#### Pour les films
- Date de visionnage
- Nombre de revisionnages
- Plateforme utilisée (Netflix, Prime, etc.)

#### Pour les séries
- Date de début/fin
- Saison et épisode actuels
- Pourcentage d'avancement (calculé)

### 2.4 Fonctionnalités de la bibliothèque

- **Filtres** : Par statut, type, note, genre, année, langue
- **Tri** : Par date d'ajout, date de lecture, note, titre, auteur
- **Recherche** : Dans sa propre bibliothèque
- **Vues** : Grille (couvertures) ou Liste (détaillée)
- **Actions rapides** : Swipe pour changer statut, noter

---

## 3. Recherche & Ajout de médias

### 3.1 Recherche unifiée

Une barre de recherche unique qui cherche dans :
- Livres (via Open Library)
- Films (via TMDB)
- Séries (via TMDB)

### 3.2 Données récupérées automatiquement

#### Livres
- Titre, Auteur(s), Couverture
- Description, Nombre de pages
- Genres, Langue
- Série + position

#### Films
- Titre, Affiche, Synopsis
- Durée, Réalisateur, Casting
- Genres, Note moyenne
- **Plateformes de streaming FR**

#### Séries
- Titre, Affiche, Synopsis
- Nombre de saisons/épisodes
- Statut (en cours, terminée, annulée)
- **Plateformes de streaming FR**

---

## 4. Système de notation & avis

### 4.1 Note principale

**Système à 5 étoiles** (demi-étoiles possibles)

### 4.2 Feedback structuré pour l'IA

#### "Qu'est-ce qui t'a plu ?"
- Les personnages
- La romance
- Le worldbuilding
- L'intrigue / le suspense
- La plume / le style d'écriture
- Les dialogues
- Les rebondissements
- L'humour
- Les émotions
- Le rythme
- La fin

#### Émotions ressenties
- M'a fait pleurer
- Coup de coeur
- Tension romantique incroyable
- Plot twist de fou
- Un peu lent
- Fin frustrante
- Feel-good
- Déchirant
- M'a fait rire

---

## 5. Passages favoris & annotations

### 5.1 Ajouter un passage (livres uniquement)

- Citation
- Page / Chapitre (optionnel)
- Note personnelle

### 5.2 Utilisation par l'IA

Les passages sont analysés pour comprendre :
- Le type de scènes qui touchent l'utilisatrice
- Le style d'écriture apprécié
- Les thématiques récurrentes

---

## 6. Système de tropes

### 6.1 Définition

Un **trope** est un motif narratif récurrent (ex: "Enemies to lovers", "Found family").

### 6.2 Préférences utilisateur

Pour chaque trope, 5 niveaux :

| Niveau | Effet sur les recos |
|--------|---------------------|
| Adore | Boost +++ |
| Aime bien | Boost + |
| Neutre | Aucun effet |
| Aime pas | Malus - |
| Blacklist | **Exclusion totale** |

---

## 7. Recommandations IA

### 7.1 Sources de données

1. Historique des médias avec notes
2. Préférences de tropes
3. Feedback structuré (ce qui a plu/déplu)
4. Passages favoris
5. Patterns (genres, auteurs favoris)

### 7.2 Modes de recommandation

1. **Mode automatique** : 3-5 suggestions sur l'accueil
2. **Mode "À la demande"** : Interface conversationnelle
3. **Mode "Mood"** : Sélection rapide d'ambiance

### 7.3 Règles strictes

1. **Jamais de média blacklisté**
2. **Jamais de média avec trope blacklisté**
3. **Jamais de média déjà lu/vu**
4. **Jamais de média déjà refusé**
5. **Toujours un média qui existe réellement**

---

## 8. Gestion des abonnements streaming

### 8.1 Abonnements configurables

- Netflix, Amazon Prime Video, Disney+
- Canal+, Apple TV+, Paramount+
- OCS, Crunchyroll, ADN

### 8.2 Utilisation

- Badge "Inclus dans tes abos" sur les résultats
- Filtre "Uniquement ce qui est inclus dans mes abos"

---

## 9. Dashboard & accueil

### 9.1 Sections

1. **En cours** : Livres/séries avec avancement
2. **Recommandations** : 3-5 suggestions IA
3. **À venir** : Suites attendues
4. **Stats rapides** : Résumé de la semaine

---

## 10. Statistiques & objectifs

### 10.1 Stats disponibles

- Livres lus, pages lues
- Films/épisodes vus
- Temps total de visionnage
- Genres les plus consommés
- Note moyenne donnée

### 10.2 Objectifs annuels

Configurer un nombre cible par type de média.

### 10.3 Classements

- Top 10 all-time
- Top 10 de l'année

---

## 11. Import de données

### 11.1 Import BookNode

Export CSV avec mapping automatique.

### 11.2 Import TV Time

Export GDPR (ZIP) avec matching TMDB.

---

## 12. Paramètres

- Profil (nom, photo)
- Abonnements streaming
- Préférences de recommandation
- Apparence (thème clair/sombre)
- Export/Import de données
- Gestion des tropes

---

## 13. Design & UX

### 13.1 Palette "Whimsical"

- Primary: Violet (#8b5cf6)
- Secondary: Vert nature (#10b981)
- Background: Cream (#FAF7F2)

### 13.2 Typographie

- Titres: Playfair Display
- Corps: Inter

### 13.3 Mobile-first

- Navigation bottom bar (5 items max)
- Touch targets: minimum 44x44px
- PWA installable

---

## 14. Écrans détaillés

| Route | Description |
|-------|-------------|
| `/` | Dashboard |
| `/books` | Bibliothèque livres |
| `/books/[id]` | Détail livre |
| `/movies` | Bibliothèque films |
| `/movies/[id]` | Détail film |
| `/shows` | Bibliothèque séries |
| `/shows/[id]` | Détail série |
| `/search` | Recherche globale |
| `/recommendations` | Toutes les recos |
| `/recommendations/ask` | Chat IA |
| `/stats` | Statistiques |
| `/stats/goals` | Objectifs |
| `/stats/rankings` | Top 10 |
| `/highlights` | Passages favoris |
| `/settings` | Paramètres |
| `/settings/tropes` | Gestion tropes |
| `/settings/subscriptions` | Abonnements |
| `/settings/import` | Import données |

---

## Priorités de développement

| Phase | Features |
|-------|----------|
| **MVP** | Recherche, Ajout, Statuts, Notes, Liste |
| **v1.1** | Tropes, Recos IA basiques |
| **v1.2** | Dashboard, Stats, Objectifs |
| **v1.3** | Import, Highlights |
