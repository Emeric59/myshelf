-- ============================================================
-- MyShelf - Seed avec de VRAIS IDs (Open Library + TMDB)
-- ============================================================
-- Ce fichier utilise des IDs réels vérifiés des APIs
-- Open Library: IDs de type OL*W (Works)
-- TMDB: IDs numériques

-- ============================================================
-- LIVRES (vrais IDs Open Library)
-- ============================================================

INSERT OR IGNORE INTO books (id, title, author, cover_url, description, page_count, published_date, genres, language, average_rating)
VALUES
  -- Fantasy
  ('OL45804W', 'Dune', 'Frank Herbert', 'https://covers.openlibrary.org/b/olid/OL45804W-L.jpg', 'Sur la planète désertique Arrakis, Paul Atreides se retrouve au cœur d''une lutte pour le contrôle de l''épice, la substance la plus précieuse de l''univers.', 688, '1965', '["Science-Fiction", "Fantasy"]', 'en', 4.6),
  ('OL27479W', 'The Hobbit', 'J.R.R. Tolkien', 'https://covers.openlibrary.org/b/olid/OL27479W-L.jpg', 'Bilbo Baggins, un hobbit tranquille, se retrouve embarqué dans une aventure épique avec des nains et un magicien.', 310, '1937', '["Fantasy", "Aventure"]', 'en', 4.7),
  ('OL27448W', 'Pride and Prejudice', 'Jane Austen', 'https://covers.openlibrary.org/b/olid/OL27448W-L.jpg', 'Elizabeth Bennet navigue les conventions sociales et ses préjugés dans l''Angleterre de la Régence.', 432, '1813', '["Romance", "Classique"]', 'en', 4.5),
  ('OL1168083W', '1984', 'George Orwell', 'https://covers.openlibrary.org/b/olid/OL1168083W-L.jpg', 'Dans un futur dystopique, Winston Smith lutte contre un régime totalitaire omniscient.', 328, '1949', '["Science-Fiction", "Dystopie"]', 'en', 4.4),
  ('OL24187W', 'The Little Prince', 'Antoine de Saint-Exupéry', 'https://covers.openlibrary.org/b/olid/OL24187W-L.jpg', 'Un aviateur échoué dans le désert rencontre un petit prince venu d''un astéroïde lointain.', 96, '1943', '["Conte", "Philosophie"]', 'fr', 4.8),
  ('OL82563W', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'https://covers.openlibrary.org/b/olid/OL82563W-L.jpg', 'Harry Potter découvre qu''il est un sorcier et entre à Poudlard, l''école de magie.', 309, '1997', '["Fantasy", "Jeunesse"]', 'en', 4.7),
  ('OL17930368W', 'The Name of the Wind', 'Patrick Rothfuss', 'https://covers.openlibrary.org/b/olid/OL17930368W-L.jpg', 'Kvothe raconte son histoire, de son enfance de saltimbanque à son entrée à l''Université.', 662, '2007', '["Fantasy", "Aventure"]', 'en', 4.5),
  ('OL362427W', 'To Kill a Mockingbird', 'Harper Lee', 'https://covers.openlibrary.org/b/olid/OL362427W-L.jpg', 'Scout Finch grandit dans le Sud des États-Unis pendant la Grande Dépression.', 324, '1960', '["Classique", "Drame"]', 'en', 4.5),
  ('OL6990157W', 'The Hunger Games', 'Suzanne Collins', 'https://covers.openlibrary.org/b/olid/OL6990157W-L.jpg', 'Katniss Everdeen doit survivre aux Hunger Games, un combat télévisé à mort.', 374, '2008', '["Dystopie", "Young Adult"]', 'en', 4.3),
  ('OL15413843W', 'Gone Girl', 'Gillian Flynn', 'https://covers.openlibrary.org/b/olid/OL15413843W-L.jpg', 'Le jour de leur anniversaire de mariage, Amy disparaît. Nick est-il coupable ?', 419, '2012', '["Thriller", "Mystère"]', 'en', 4.1);

-- Bibliothèque utilisateur (user_books)
INSERT OR IGNORE INTO user_books (book_id, status, rating, started_at, finished_at, current_page, reread_count, notes)
VALUES
  ('OL45804W', 'read', 5, '2024-01-15', '2024-02-10', 688, 1, 'Chef d''oeuvre de la SF. Le worldbuilding est incroyable.'),
  ('OL27479W', 'read', 4.5, '2024-03-01', '2024-03-15', 310, 2, 'Classique indémodable, relu avec plaisir.'),
  ('OL27448W', 'read', 4.5, '2024-04-01', '2024-04-20', 432, 1, 'Darcy <3 La plume d''Austen est délicieuse.'),
  ('OL1168083W', 'read', 4, '2024-05-10', '2024-05-25', 328, 0, 'Glaçant et toujours d''actualité.'),
  ('OL24187W', 'read', 5, '2024-06-01', '2024-06-02', 96, 3, 'On ne voit bien qu''avec le coeur.'),
  ('OL82563W', 'read', 4.5, '2024-07-01', '2024-07-10', 309, 4, 'La magie de la première lecture ne s''estompe jamais.'),
  ('OL17930368W', 'reading', NULL, '2024-11-01', NULL, 350, 0, 'En cours - prose magnifique'),
  ('OL362427W', 'to_read', NULL, NULL, NULL, 0, 0, 'Classique à découvrir'),
  ('OL6990157W', 'read', 4, '2024-08-15', '2024-08-25', 374, 0, 'Page-turner efficace'),
  ('OL15413843W', 'read', 4, '2024-09-01', '2024-09-10', 419, 0, 'Twist final mémorable');

-- ============================================================
-- FILMS (vrais IDs TMDB)
-- ============================================================

INSERT OR IGNORE INTO movies (id, title, original_title, poster_url, backdrop_url, description, runtime, release_date, director, genres, language, average_rating)
VALUES
  ('550', 'Fight Club', 'Fight Club', 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg', 'Un employé de bureau insomniaque et un vendeur de savon charismatique forment un club de combat clandestin.', 139, '1999-10-15', 'David Fincher', '["Drame", "Thriller"]', 'en', 8.4),
  ('27205', 'Inception', 'Inception', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', 'Un voleur qui s''infiltre dans les rêves reçoit une mission impossible : implanter une idée.', 148, '2010-07-16', 'Christopher Nolan', '["Science-Fiction", "Action", "Thriller"]', 'en', 8.3),
  ('278', 'Les Évadés', 'The Shawshank Redemption', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', 'Andy Dufresne est condamné à perpétuité pour le meurtre de sa femme.', 142, '1994-09-23', 'Frank Darabont', '["Drame", "Crime"]', 'en', 8.7),
  ('680', 'Pulp Fiction', 'Pulp Fiction', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', 'L''odyssée sanglante de petits malfrats à Los Angeles.', 154, '1994-10-14', 'Quentin Tarantino', '["Thriller", "Crime"]', 'en', 8.5),
  ('157336', 'Interstellar', 'Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 'Des explorateurs traversent un trou de ver pour sauver l''humanité.', 169, '2014-11-05', 'Christopher Nolan', '["Science-Fiction", "Aventure", "Drame"]', 'en', 8.4),
  ('603', 'Matrix', 'The Matrix', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg', 'Un programmeur découvre que la réalité est une simulation.', 136, '1999-03-31', 'Lana & Lilly Wachowski', '["Action", "Science-Fiction"]', 'en', 8.2),
  ('238', 'Le Parrain', 'The Godfather', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', 'La saga de la famille Corleone, une puissante famille mafieuse.', 175, '1972-03-14', 'Francis Ford Coppola', '["Drame", "Crime"]', 'en', 8.7),
  ('496243', 'Parasite', 'Gisaengchung', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg', 'Une famille pauvre s''infiltre chez des riches, avec des conséquences inattendues.', 132, '2019-05-30', 'Bong Joon-ho', '["Thriller", "Comédie", "Drame"]', 'ko', 8.5),
  ('120', 'Le Seigneur des Anneaux : La Communauté de l''Anneau', 'The Lord of the Rings: The Fellowship of the Ring', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', 'https://image.tmdb.org/t/p/w1280/pIUvQ9Ed35wlWhY2oU6OmwEsmzG.jpg', 'Frodon doit détruire l''Anneau Unique pour sauver la Terre du Milieu.', 178, '2001-12-19', 'Peter Jackson', '["Aventure", "Fantasy", "Action"]', 'en', 8.4),
  ('274', 'Le Silence des Agneaux', 'The Silence of the Lambs', 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', 'https://image.tmdb.org/t/p/w1280/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg', 'Une jeune recrue du FBI demande l''aide d''Hannibal Lecter pour attraper un tueur en série.', 118, '1991-02-01', 'Jonathan Demme', '["Thriller", "Crime", "Horreur"]', 'en', 8.3);

-- Bibliothèque utilisateur (user_movies)
INSERT OR IGNORE INTO user_movies (movie_id, status, rating, watched_at, rewatch_count, watched_on, notes)
VALUES
  ('550', 'watched', 5, '2024-01-20', 2, 'Netflix', 'Premier et deuxième visionnage, toujours aussi percutant'),
  ('27205', 'watched', 4.5, '2024-02-14', 1, 'Prime Video', 'BWAAAAM - Nolan au sommet'),
  ('278', 'watched', 5, '2024-03-05', 0, 'Netflix', 'Magnifique. L''espoir comme moteur.'),
  ('680', 'watched', 4, '2024-04-12', 1, 'Prime Video', 'Dialogues cultes'),
  ('157336', 'watched', 5, '2024-06-20', 2, 'Cinéma', 'MURPH! Chef d''oeuvre émotionnel.'),
  ('603', 'watched', 4.5, '2024-07-15', 1, 'Prime Video', 'Red pill - révolutionnaire'),
  ('238', 'watched', 5, '2024-08-01', 1, 'Blu-ray', 'Perfection cinématographique'),
  ('496243', 'watched', 5, '2024-09-30', 0, 'Cinéma', 'Incroyable twist, critique sociale acerbe'),
  ('120', 'watched', 5, '2024-10-15', 3, 'Blu-ray', 'Version longue, toujours magique'),
  ('274', 'to_watch', NULL, NULL, 0, NULL, 'Classique à voir');

-- ============================================================
-- SERIES (vrais IDs TMDB)
-- ============================================================

INSERT OR IGNORE INTO shows (id, title, original_title, poster_url, backdrop_url, description, first_air_date, status, seasons_count, episodes_count, episode_runtime, creators, genres, language, average_rating)
VALUES
  ('1396', 'Breaking Bad', 'Breaking Bad', 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', 'Un professeur de chimie se lance dans la fabrication de méthamphétamine.', '2008-01-20', 'Ended', 5, 62, 47, 'Vince Gilligan', '["Drame", "Crime", "Thriller"]', 'en', 8.9),
  ('66732', 'Stranger Things', 'Stranger Things', 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', 'Des enfants affrontent des forces surnaturelles dans les années 80.', '2016-07-15', 'Returning Series', 4, 34, 50, 'The Duffer Brothers', '["Drame", "Fantastique", "Horreur"]', 'en', 8.6),
  ('1399', 'Game of Thrones', 'Game of Thrones', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', 'https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcU6pToj6s.jpg', 'Plusieurs familles se battent pour le Trône de Fer.', '2011-04-17', 'Ended', 8, 73, 57, 'David Benioff, D.B. Weiss', '["Drame", "Fantasy", "Aventure"]', 'en', 8.4),
  ('76479', 'The Boys', 'The Boys', 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg', 'https://image.tmdb.org/t/p/w1280/7Ns6tO3aYjppI5bFhyYZurOYGBT.jpg', 'Des anti-héros combattent des super-héros corrompus.', '2019-07-26', 'Returning Series', 4, 32, 60, 'Eric Kripke', '["Action", "Comédie", "Crime"]', 'en', 8.5),
  ('94997', 'House of the Dragon', 'House of the Dragon', 'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg', 'https://image.tmdb.org/t/p/w1280/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg', 'La guerre civile des Targaryen, 200 ans avant Game of Thrones.', '2022-08-21', 'Returning Series', 2, 18, 60, 'Ryan Condal, George R.R. Martin', '["Drame", "Fantasy", "Action"]', 'en', 8.4),
  ('60625', 'Rick et Morty', 'Rick and Morty', 'https://image.tmdb.org/t/p/w500/cvhNj9eoRBe5SxjCbQTkh05wM3E.jpg', 'https://image.tmdb.org/t/p/w1280/rBF8wVQN8hTWHspVZBlI3h7HZJ.jpg', 'Les aventures interdimensionnelles d''un scientifique génial et de son petit-fils.', '2013-12-02', 'Returning Series', 7, 71, 22, 'Dan Harmon, Justin Roiland', '["Animation", "Comédie", "Science-Fiction"]', 'en', 8.7),
  ('82856', 'The Mandalorian', 'The Mandalorian', 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', 'https://image.tmdb.org/t/p/w1280/9ijMGlJKqcslswWUzTEwScm82Gs.jpg', 'Un chasseur de primes solitaire dans les confins de la galaxie.', '2019-11-12', 'Returning Series', 3, 24, 40, 'Jon Favreau', '["Science-Fiction", "Action", "Aventure"]', 'en', 8.5),
  ('71446', 'La Casa de Papel', 'La Casa de Papel', 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', 'https://image.tmdb.org/t/p/w1280/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg', 'Un groupe de braqueurs prend d''assaut la Monnaie Royale d''Espagne.', '2017-05-02', 'Ended', 5, 41, 50, 'Álex Pina', '["Crime", "Drame", "Action"]', 'es', 8.2),
  ('100088', 'The Last of Us', 'The Last of Us', 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', 'Joel et Ellie traversent une Amérique ravagée par une pandémie.', '2023-01-15', 'Returning Series', 1, 9, 55, 'Craig Mazin, Neil Druckmann', '["Drame", "Action", "Aventure"]', 'en', 8.8),
  ('93405', 'Squid Game', 'Ojingeo geim', 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', 'https://image.tmdb.org/t/p/w1280/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg', 'Des personnes endettées participent à des jeux mortels pour de l''argent.', '2021-09-17', 'Returning Series', 2, 9, 55, 'Hwang Dong-hyuk', '["Thriller", "Drame", "Action"]', 'ko', 8.0);

-- Bibliothèque utilisateur (user_shows)
INSERT OR IGNORE INTO user_shows (show_id, status, rating, started_at, finished_at, current_season, current_episode, watched_on, notes)
VALUES
  ('1396', 'watched', 5, '2023-06-01', '2023-08-15', 5, 62, 'Netflix', 'Meilleure série de tous les temps. Arc de Walter White parfait.'),
  ('66732', 'watching', NULL, '2024-10-01', NULL, 4, 5, 'Netflix', 'En cours de visionnage'),
  ('1399', 'watched', 4, '2022-01-01', '2022-03-15', 8, 73, 'Max', 'Fin décevante mais le voyage valait le coup'),
  ('76479', 'watched', 4.5, '2024-03-01', '2024-05-15', 4, 32, 'Prime Video', 'Homelander terrifiant, satire brillante'),
  ('94997', 'watched', 4.5, '2024-01-10', '2024-02-28', 2, 18, 'Max', 'En attente de la saison 3 avec impatience'),
  ('60625', 'watching', NULL, '2024-09-01', NULL, 5, 3, 'Netflix', 'Visionnage occasionnel'),
  ('82856', 'paused', 4, '2023-11-01', NULL, 2, 4, 'Disney+', 'Pause en attendant d''être motivé'),
  ('71446', 'watched', 4, '2024-07-01', '2024-08-20', 5, 41, 'Netflix', 'Bella ciao! Addictif.'),
  ('100088', 'watched', 5, '2024-02-01', '2024-02-15', 1, 9, 'Max', 'Adaptation parfaite du jeu. Episode 3 dévastateur.'),
  ('93405', 'watched', 4, '2024-04-01', '2024-04-10', 1, 9, 'Netflix', 'Concept génial, critique sociale efficace');

-- ============================================================
-- REVIEWS
-- ============================================================

INSERT OR IGNORE INTO reviews (media_type, media_id, comment, liked_aspects, disliked_aspects, emotions)
VALUES
  ('book', 'OL45804W', 'Le worldbuilding est extraordinaire. Herbert a créé un univers d''une richesse inégalée. La politique, l''écologie, la religion - tout est entrelacé avec maestria.', '["worldbuilding", "personnages", "intrigue"]', '["rythme"]', '["coup_de_coeur", "m_a_fait_reflechir"]'),
  ('book', 'OL24187W', 'Un conte universel qui touche les adultes autant que les enfants. Chaque relecture révèle de nouvelles profondeurs.', '["prose", "emotions", "philosophie"]', '[]', '["m_a_fait_pleurer", "coup_de_coeur"]'),
  ('movie', '550', 'Un film qui ne vieillit pas. La twist finale est culte, mais c''est surtout la réflexion sur la société de consommation qui marque.', '["scenario", "twist", "realisation"]', '[]', '["m_a_fait_reflechir"]'),
  ('movie', '157336', 'Nolan à son meilleur. L''émotion pure de la relation père-fille, la science crédible, la musique de Hans Zimmer... Un chef d''oeuvre.', '["musique", "emotion", "visuels", "scenario"]', '[]', '["m_a_fait_pleurer", "coup_de_coeur"]'),
  ('movie', '496243', 'Un film qui transcende les genres. Drôle, tendu, social, horrifique... Bong Joon-ho est un génie.', '["scenario", "realisation", "twist", "critique_sociale"]', '[]', '["m_a_fait_reflechir", "coup_de_coeur"]'),
  ('show', '1396', 'La transformation de Walter White est l''un des meilleurs arcs de personnage de la télévision. Chaque saison surpasse la précédente.', '["personnages", "scenario", "evolution", "tension"]', '[]', '["coup_de_coeur", "m_a_fait_reflechir"]'),
  ('show', '100088', 'L''adaptation parfaite. Pedro Pascal et Bella Ramsey ont une alchimie incroyable. L''épisode 3 est un chef d''oeuvre à lui seul.', '["adaptation", "acteurs", "emotion", "realisation"]', '[]', '["m_a_fait_pleurer", "coup_de_coeur"]');

-- ============================================================
-- HIGHLIGHTS (passages favoris)
-- ============================================================

INSERT OR IGNORE INTO highlights (book_id, content, page_number, chapter, personal_note)
VALUES
  ('OL45804W', 'La peur tue l''esprit. La peur est la petite mort qui conduit à l''oblitération totale.', 12, 'Chapitre 1', 'La litanie contre la peur, citation iconique'),
  ('OL45804W', 'Celui qui contrôle l''épice contrôle l''univers.', 45, 'Chapitre 5', NULL),
  ('OL24187W', 'On ne voit bien qu''avec le coeur. L''essentiel est invisible pour les yeux.', 72, 'Chapitre 21', 'LA citation'),
  ('OL24187W', 'Tu deviens responsable pour toujours de ce que tu as apprivoisé.', 75, 'Chapitre 21', 'Le renard a raison'),
  ('OL1168083W', 'La guerre c''est la paix. La liberté c''est l''esclavage. L''ignorance c''est la force.', 6, 'Partie 1', 'Les slogans du Parti - glaçant'),
  ('OL27448W', 'C''est une vérité universellement reconnue qu''un célibataire pourvu d''une belle fortune doit avoir envie de se marier.', 1, 'Chapitre 1', 'Première phrase parfaite');

-- ============================================================
-- OBJECTIFS 2025
-- ============================================================

INSERT OR IGNORE INTO goals (year, media_type, target)
VALUES
  (2025, 'book', 24),
  (2025, 'movie', 52),
  (2025, 'show', 6);
