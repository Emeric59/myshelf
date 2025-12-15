-- ============================================================
-- MyShelf Test Data Seed
-- ============================================================
-- Ce fichier contient des données fictives pour tester l'app
-- Les IDs sont inventés mais suivent le format des vraies APIs

-- ============================================================
-- LIVRES
-- ============================================================

INSERT OR IGNORE INTO books (id, title, author, cover_url, description, page_count, published_date, genres, series_name, series_position, language, average_rating)
VALUES
  ('OL12345W', 'Le Nom du Vent', 'Patrick Rothfuss', 'https://covers.openlibrary.org/b/id/8259447-L.jpg', 'Kvothe raconte son histoire depuis ses débuts dans une troupe de comédiens ambulants jusqu''à son entrée à l''Université.', 662, '2007', '["Fantasy", "Aventure"]', 'Chronique du Tueur de Roi', 1, 'fr', 4.5),
  ('OL12346W', 'La Peur du Sage', 'Patrick Rothfuss', 'https://covers.openlibrary.org/b/id/8259448-L.jpg', 'La suite des aventures de Kvothe, entre l''Université et ses voyages.', 1008, '2011', '["Fantasy", "Aventure"]', 'Chronique du Tueur de Roi', 2, 'fr', 4.3),
  ('OL22222W', 'Orgueil et Préjugés', 'Jane Austen', 'https://covers.openlibrary.org/b/id/6737956-L.jpg', 'Elizabeth Bennet et Mr Darcy dans l''Angleterre de la Régence.', 432, '1813', '["Romance", "Classique"]', NULL, NULL, 'fr', 4.7),
  ('OL33333W', 'Dune', 'Frank Herbert', 'https://covers.openlibrary.org/b/id/8091557-L.jpg', 'Paul Atreides sur la planète désertique Arrakis.', 688, '1965', '["Science-Fiction", "Aventure"]', 'Dune', 1, 'fr', 4.6),
  ('OL44444W', 'Le Petit Prince', 'Antoine de Saint-Exupéry', 'https://covers.openlibrary.org/b/id/8257991-L.jpg', 'Un pilote échoué dans le désert rencontre un petit prince venu d''une autre planète.', 96, '1943', '["Conte", "Philosophie"]', NULL, NULL, 'fr', 4.8),
  ('OL55555W', 'Projet Rosie', 'Graeme Simsion', 'https://covers.openlibrary.org/b/id/7890123-L.jpg', 'Don Tillman, professeur de génétique, lance le Projet Épouse pour trouver la femme idéale.', 320, '2013', '["Romance", "Comédie"]', NULL, NULL, 'fr', 4.1),
  ('OL66666W', 'La Cinquième Saison', 'N.K. Jemisin', 'https://covers.openlibrary.org/b/id/8012345-L.jpg', 'Sur une terre ravagée par des catastrophes, Essun recherche sa fille kidnappée.', 512, '2015', '["Fantasy", "Science-Fiction"]', 'Les Livres de la Terre Fracturée', 1, 'fr', 4.4),
  ('OL77777W', 'Les Hauts de Hurlevent', 'Emily Brontë', 'https://covers.openlibrary.org/b/id/7654321-L.jpg', 'L''histoire passionnée et destructrice de Heathcliff et Catherine.', 416, '1847', '["Classique", "Romance"]', NULL, NULL, 'fr', 4.2),
  ('OL88888W', 'Station Eleven', 'Emily St. John Mandel', 'https://covers.openlibrary.org/b/id/8123456-L.jpg', 'Une troupe de théâtre itinérante parcourt les restes de la civilisation après une pandémie.', 352, '2014', '["Science-Fiction", "Littéraire"]', NULL, NULL, 'fr', 4.3),
  ('OL99999W', 'L''Assassin Royal - L''Apprenti Assassin', 'Robin Hobb', 'https://covers.openlibrary.org/b/id/7543210-L.jpg', 'Fitz, bâtard royal, est formé aux arts de l''assassinat.', 480, '1995', '["Fantasy", "Aventure"]', 'L''Assassin Royal', 1, 'fr', 4.5);

-- Bibliothèque utilisateur (user_books)
INSERT OR IGNORE INTO user_books (book_id, status, rating, started_at, finished_at, current_page, reread_count, notes)
VALUES
  ('OL12345W', 'read', 5, '2024-01-15', '2024-02-10', 662, 1, 'Chef d''oeuvre absolu. Prose magnifique.'),
  ('OL12346W', 'reading', NULL, '2024-11-01', NULL, 450, 0, 'En cours de relecture'),
  ('OL22222W', 'read', 4.5, '2024-03-01', '2024-03-15', 432, 2, 'Darcy <3'),
  ('OL33333W', 'read', 4, '2024-05-10', '2024-06-01', 688, 0, 'Dense mais fascinant'),
  ('OL44444W', 'read', 5, '2024-07-20', '2024-07-21', 96, 3, 'On voit bien avec le coeur'),
  ('OL55555W', 'to_read', NULL, NULL, NULL, 0, 0, 'Recommandé par Marie'),
  ('OL66666W', 'read', 4.5, '2024-08-01', '2024-08-20', 512, 0, 'Narration unique, worldbuilding incroyable'),
  ('OL77777W', 'abandoned', 2.5, '2024-09-01', NULL, 150, 0, 'Trop sombre pour moi'),
  ('OL88888W', 'to_read', NULL, NULL, NULL, 0, 0, NULL),
  ('OL99999W', 'read', 4.5, '2024-10-01', '2024-10-25', 480, 0, 'Excellent début de saga');

-- ============================================================
-- FILMS
-- ============================================================

INSERT OR IGNORE INTO movies (id, title, original_title, poster_url, description, runtime, release_date, director, genres, language, average_rating)
VALUES
  ('550', 'Fight Club', 'Fight Club', 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'Un employé de bureau insomniaque et un vendeur de savon charismatique forment un club de combat clandestin.', 139, '1999-10-15', 'David Fincher', '["Drame", "Thriller"]', 'en', 8.4),
  ('27205', 'Inception', 'Inception', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'Un voleur qui s''infiltre dans les rêves reçoit une mission impossible : implanter une idée.', 148, '2010-07-16', 'Christopher Nolan', '["Science-Fiction", "Action", "Thriller"]', 'en', 8.3),
  ('278', 'Les Évadés', 'The Shawshank Redemption', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'Andy Dufresne est condamné à perpétuité pour le meurtre de sa femme.', 142, '1994-09-23', 'Frank Darabont', '["Drame", "Crime"]', 'en', 8.7),
  ('680', 'Pulp Fiction', 'Pulp Fiction', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'L''odyssée sanglante de petits malfrats à Los Angeles.', 154, '1994-10-14', 'Quentin Tarantino', '["Thriller", "Crime"]', 'en', 8.5),
  ('13', 'Forrest Gump', 'Forrest Gump', 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', 'L''histoire de Forrest Gump, un homme simple au destin extraordinaire.', 142, '1994-07-06', 'Robert Zemeckis', '["Drame", "Comédie", "Romance"]', 'en', 8.5),
  ('157336', 'Interstellar', 'Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'Des explorateurs traversent un trou de ver pour sauver l''humanité.', 169, '2014-11-05', 'Christopher Nolan', '["Science-Fiction", "Aventure", "Drame"]', 'en', 8.4),
  ('120', 'Le Seigneur des Anneaux : La Communauté de l''Anneau', 'The Lord of the Rings: The Fellowship of the Ring', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', 'Frodon doit détruire l''Anneau Unique pour sauver la Terre du Milieu.', 178, '2001-12-19', 'Peter Jackson', '["Aventure", "Fantasy", "Action"]', 'en', 8.4),
  ('603', 'Matrix', 'The Matrix', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'Un programmeur découvre que la réalité est une simulation.', 136, '1999-03-31', 'Lana & Lilly Wachowski', '["Action", "Science-Fiction"]', 'en', 8.2),
  ('238', 'Le Parrain', 'The Godfather', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'La saga de la famille Corleone, une puissante famille mafieuse.', 175, '1972-03-14', 'Francis Ford Coppola', '["Drame", "Crime"]', 'en', 8.7),
  ('496243', 'Parasite', 'Gisaengchung', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'Une famille pauvre s''infiltre chez des riches, avec des conséquences inattendues.', 132, '2019-05-30', 'Bong Joon-ho', '["Thriller", "Comédie", "Drame"]', 'ko', 8.5);

-- Bibliothèque utilisateur (user_movies)
INSERT OR IGNORE INTO user_movies (movie_id, status, rating, watched_at, rewatch_count, watched_on, notes)
VALUES
  ('550', 'watched', 5, '2024-01-20', 2, 'Netflix', 'Premier et deuxième visionnage, toujours aussi percutant'),
  ('27205', 'watched', 4.5, '2024-02-14', 1, 'Prime Video', 'BWAAAAM'),
  ('278', 'watched', 5, '2024-03-05', 0, 'Netflix', 'Magnifique'),
  ('680', 'watched', 4, '2024-04-12', 1, 'Prime Video', 'Dialogues cultes'),
  ('13', 'to_watch', NULL, NULL, 0, NULL, 'Classique à voir'),
  ('157336', 'watched', 5, '2024-06-20', 2, 'Cinéma', 'MURPH! Chef d''oeuvre.'),
  ('120', 'watched', 5, '2024-08-01', 3, 'Blu-ray', 'Version longue, toujours un plaisir'),
  ('603', 'watched', 4.5, '2024-09-15', 1, 'Prime Video', 'Red pill'),
  ('238', 'to_watch', NULL, NULL, 0, NULL, 'Il paraît que c''est bien'),
  ('496243', 'watched', 5, '2024-10-30', 0, 'Cinéma', 'Incroyable twist');

-- ============================================================
-- SERIES
-- ============================================================

INSERT OR IGNORE INTO shows (id, title, original_title, poster_url, description, first_air_date, status, seasons_count, episodes_count, episode_runtime, genres, language, average_rating)
VALUES
  ('1396', 'Breaking Bad', 'Breaking Bad', 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'Un professeur de chimie se lance dans la fabrication de méthamphétamine.', '2008-01-20', 'Ended', 5, 62, 47, '["Drame", "Crime", "Thriller"]', 'en', 8.9),
  ('66732', 'Stranger Things', 'Stranger Things', 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', 'Des enfants affrontent des forces surnaturelles dans les années 80.', '2016-07-15', 'Returning Series', 4, 34, 50, '["Drame", "Fantastique", "Horreur"]', 'en', 8.6),
  ('94997', 'House of the Dragon', 'House of the Dragon', 'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg', 'La guerre civile des Targaryen, 200 ans avant Game of Thrones.', '2022-08-21', 'Returning Series', 2, 18, 60, '["Drame", "Fantasy", "Action"]', 'en', 8.4),
  ('1399', 'Game of Thrones', 'Game of Thrones', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', 'Plusieurs familles se battent pour le Trône de Fer.', '2011-04-17', 'Ended', 8, 73, 57, '["Drame", "Fantasy", "Aventure"]', 'en', 8.4),
  ('60625', 'Rick et Morty', 'Rick and Morty', 'https://image.tmdb.org/t/p/w500/cvhNj9eoRBe5SxjCbQTkh05wM3E.jpg', 'Les aventures interdimensionnelles d''un scientifique génial et de son petit-fils.', '2013-12-02', 'Returning Series', 7, 71, 22, '["Animation", "Comédie", "Science-Fiction"]', 'en', 8.7),
  ('76479', 'The Boys', 'The Boys', 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg', 'Des anti-héros combattent des super-héros corrompus.', '2019-07-26', 'Returning Series', 4, 32, 60, '["Action", "Comédie", "Crime"]', 'en', 8.5),
  ('82856', 'The Mandalorian', 'The Mandalorian', 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', 'Un chasseur de primes solitaire dans les confins de la galaxie.', '2019-11-12', 'Returning Series', 3, 24, 40, '["Science-Fiction", "Action", "Aventure"]', 'en', 8.5),
  ('63174', 'Lucifer', 'Lucifer', 'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg', 'Le Diable quitte l''Enfer pour Los Angeles et devient consultant pour la police.', '2016-01-25', 'Ended', 6, 93, 45, '["Crime", "Science-Fiction", "Drame"]', 'en', 8.2),
  ('71446', 'La Casa de Papel', 'La Casa de Papel', 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', 'Un groupe de braqueurs prend d''assaut la Monnaie Royale d''Espagne.', '2017-05-02', 'Ended', 5, 41, 50, '["Crime", "Drame", "Action"]', 'es', 8.2),
  ('93405', 'Squid Game', 'Ojingeo geim', 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', 'Des personnes endettées participent à des jeux mortels pour de l''argent.', '2021-09-17', 'Returning Series', 2, 9, 55, '["Thriller", "Drame", "Action"]', 'ko', 8.0);

-- Bibliothèque utilisateur (user_shows)
INSERT OR IGNORE INTO user_shows (show_id, status, rating, started_at, finished_at, current_season, current_episode, watched_on, notes)
VALUES
  ('1396', 'watched', 5, '2023-06-01', '2023-08-15', 5, 62, 'Netflix', 'Meilleure série de tous les temps'),
  ('66732', 'watching', NULL, '2024-10-01', NULL, 4, 5, 'Netflix', 'En cours de visionnage'),
  ('94997', 'watched', 4.5, '2024-01-10', '2024-02-28', 2, 18, 'Max', 'En attente de la saison 3'),
  ('1399', 'watched', 4, '2022-01-01', '2022-03-15', 8, 73, 'Max', 'Fin décevante mais le voyage valait le coup'),
  ('60625', 'watching', NULL, '2024-09-01', NULL, 5, 3, 'Netflix', 'Visionnage occasionnel'),
  ('76479', 'watched', 4.5, '2024-03-01', '2024-05-15', 4, 32, 'Prime Video', 'Homelander terrifiant'),
  ('82856', 'paused', 4, '2023-11-01', NULL, 2, 4, 'Disney+', 'Pause en attendant d''être motivé'),
  ('63174', 'abandoned', 3, '2024-06-01', NULL, 3, 5, 'Netflix', 'Trop répétitif'),
  ('71446', 'watched', 4, '2024-07-01', '2024-08-20', 5, 41, 'Netflix', 'Bella ciao!'),
  ('93405', 'to_watch', NULL, NULL, NULL, 1, 0, NULL, 'Recommandé par tout le monde');

-- ============================================================
-- REVIEWS
-- ============================================================

INSERT OR IGNORE INTO reviews (media_type, media_id, comment, liked_aspects, disliked_aspects, emotions)
VALUES
  ('book', 'OL12345W', 'Une prose magnifique, des personnages inoubliables. Kvothe est fascinant, à la fois brillant et faillible. Le système de magie est l''un des plus originaux que j''ai lus.', '["prose", "worldbuilding", "personnages", "systeme_magie"]', '["rythme_lent"]', '["coup_de_coeur", "envie_relire"]'),
  ('book', 'OL22222W', 'Un classique indémodable. Elizabeth est une héroïne moderne avant l''heure. Les dialogues sont savoureux et la romance parfaitement construite.', '["romance", "dialogues", "personnages"]', '[]', '["coup_de_coeur", "feel_good"]'),
  ('book', 'OL66666W', 'Une narration à la deuxième personne audacieuse qui fonctionne parfaitement. Le worldbuilding est complexe mais fascinant. Essun est une héroïne marquante.', '["worldbuilding", "narration", "personnages"]', '["complexite"]', '["m_a_fait_pleurer", "coup_de_coeur"]'),
  ('movie', '550', 'Un film qui ne vieillit pas. La twist finale est culte, mais c''est surtout la réflexion sur la société de consommation qui marque.', '["scenario", "twist", "realisateur"]', '[]', '["m_a_fait_reflechir"]'),
  ('movie', '157336', 'Nolan à son meilleur. L''émotion pure de la relation père-fille, la science (relativement) crédible, la musique de Hans Zimmer...', '["musique", "emotion", "visuels", "scenario"]', '[]', '["m_a_fait_pleurer", "coup_de_coeur"]'),
  ('movie', '496243', 'Un film qui transcende les genres. Drôle, tendu, social, horrifique... Bong Joon-ho est un génie.', '["scenario", "realisateur", "twist", "critique_sociale"]', '[]', '["m_a_fait_reflechir", "coup_de_coeur"]'),
  ('show', '1396', 'La transformation de Walter White est l''une des meilleures arcs de personnage de la télévision. Chaque saison est meilleure que la précédente.', '["personnages", "scenario", "evolution", "tension"]', '[]', '["coup_de_coeur", "m_a_fait_reflechir"]'),
  ('show', '76479', 'Une déconstruction brillante du genre super-héros. Homelander est l''un des meilleurs méchants récents.', '["personnages", "humour_noir", "action", "critique_sociale"]', '["violence_excessive"]', '["m_a_fait_rire", "m_a_fait_reflechir"]');

-- ============================================================
-- HIGHLIGHTS (passages favoris)
-- ============================================================

INSERT OR IGNORE INTO highlights (book_id, content, page_number, chapter, personal_note)
VALUES
  ('OL12345W', 'Il y a trois choses que tout homme sage devrait craindre : la mer par une nuit sans lune, une nuit sans étoiles et la colère d''un homme doux.', 45, 'Chapitre 5', 'Une des meilleures citations du livre'),
  ('OL12345W', 'Les mots sont de pâles ombres de noms oubliés. Comme les noms ont du pouvoir, les mots ont du pouvoir. Les mots peuvent allumer des feux dans l''esprit des hommes.', 234, 'Chapitre 20', NULL),
  ('OL22222W', 'Il est heureux que nous soyons séparés par une telle distance. Vous m''êtes tellement indifférent que nous pouvons nous quitter bons amis.', 312, NULL, 'Elizabeth est badass'),
  ('OL44444W', 'On ne voit bien qu''avec le coeur. L''essentiel est invisible pour les yeux.', 72, 'Chapitre 21', 'LA citation'),
  ('OL44444W', 'Tu deviens responsable pour toujours de ce que tu as apprivoisé.', 75, 'Chapitre 21', 'Le renard a raison'),
  ('OL66666W', 'C''est la fin du monde. C''est encore le monde.', 1, 'Prologue', 'Phrase d''ouverture qui donne le ton');

-- ============================================================
-- OBJECTIFS 2025
-- ============================================================

INSERT OR IGNORE INTO goals (year, media_type, target)
VALUES
  (2025, 'book', 24),
  (2025, 'movie', 52),
  (2025, 'show', 6);

-- ============================================================
-- QUELQUES PREFERENCES DE TROPES (si les tropes sont seedés)
-- ============================================================

-- On vérifie d'abord si des tropes existent
INSERT OR IGNORE INTO user_trope_preferences (trope_id, preference, weight)
SELECT id, 'love', 10 FROM tropes WHERE slug = 'enemies-to-lovers' LIMIT 1;

INSERT OR IGNORE INTO user_trope_preferences (trope_id, preference, weight)
SELECT id, 'love', 9 FROM tropes WHERE slug = 'found-family' LIMIT 1;

INSERT OR IGNORE INTO user_trope_preferences (trope_id, preference, weight)
SELECT id, 'like', 7 FROM tropes WHERE slug = 'slow-burn' LIMIT 1;

INSERT OR IGNORE INTO user_trope_preferences (trope_id, preference, weight)
SELECT id, 'dislike', 3 FROM tropes WHERE slug = 'love-triangle' LIMIT 1;

INSERT OR IGNORE INTO user_trope_preferences (trope_id, preference, weight)
SELECT id, 'blacklist', 1 FROM tropes WHERE slug = 'cheating' LIMIT 1;
