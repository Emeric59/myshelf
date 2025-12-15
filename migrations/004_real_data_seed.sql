-- ============================================================
-- Migration: Real data seed with verified Open Library + TMDB IDs
-- ============================================================
-- All IDs have been verified via official APIs on 2025-12-15.
-- This data can be reset at the end of development.

-- ============================================================
-- BOOKS (Open Library - 10 verified entries)
-- ============================================================

INSERT INTO books (id, title, author, cover_url, page_count, genres, published_date) VALUES
-- Dune by Frank Herbert (verified: OL893415W, cover: 11481354)
('OL893415W', 'Dune', 'Frank Herbert', 'https://covers.openlibrary.org/b/id/11481354-M.jpg', 658, '["Science Fiction", "Fantasy"]', '1965'),
-- The Hobbit by J.R.R. Tolkien (verified: OL27482W, cover: 14627509)
('OL27482W', 'The Hobbit', 'J.R.R. Tolkien', 'https://covers.openlibrary.org/b/id/14627509-M.jpg', 310, '["Fantasy", "Adventure"]', '1937'),
-- 1984 by George Orwell (verified: OL1168083W, cover: 9267242)
('OL1168083W', '1984', 'George Orwell', 'https://covers.openlibrary.org/b/id/9267242-M.jpg', 328, '["Dystopian", "Science Fiction"]', '1949'),
-- Harry Potter and the Philosopher's Stone (verified: OL82563W, cover: 10521270)
('OL82563W', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'https://covers.openlibrary.org/b/id/10521270-M.jpg', 309, '["Fantasy", "Young Adult"]', '1997'),
-- The Name of the Wind by Patrick Rothfuss (verified: OL8479867W, cover: 11480483)
('OL8479867W', 'The Name of the Wind', 'Patrick Rothfuss', 'https://covers.openlibrary.org/b/id/11480483-M.jpg', 662, '["Fantasy", "Adventure"]', '2007'),
-- Project Hail Mary by Andy Weir (verified: OL21745884W, cover: 11200092)
('OL21745884W', 'Project Hail Mary', 'Andy Weir', 'https://covers.openlibrary.org/b/id/11200092-M.jpg', 496, '["Science Fiction", "Adventure"]', '2021'),
-- A Court of Thorns and Roses by Sarah J. Maas (verified: OL17352669W, cover: 8738585)
('OL17352669W', 'A Court of Thorns and Roses', 'Sarah J. Maas', 'https://covers.openlibrary.org/b/id/8738585-M.jpg', 416, '["Fantasy", "Romance"]', '2015'),
-- Le Petit Prince by Antoine de Saint-Exupery (verified: OL10263W, cover: 10708272)
('OL10263W', 'Le Petit Prince', 'Antoine de Saint-Exupery', 'https://covers.openlibrary.org/b/id/10708272-M.jpg', 96, '["Fantasy", "Children"]', '1943'),
-- Pride and Prejudice by Jane Austen (verified: OL66554W, cover: 14348537)
('OL66554W', 'Pride and Prejudice', 'Jane Austen', 'https://covers.openlibrary.org/b/id/14348537-M.jpg', 432, '["Romance", "Classic"]', '1813'),
-- Gone Girl by Gillian Flynn (verified: OL16239762W, cover: 8368314)
('OL16239762W', 'Gone Girl', 'Gillian Flynn', 'https://covers.openlibrary.org/b/id/8368314-M.jpg', 415, '["Thriller", "Mystery"]', '2012');

-- User book entries (varied statuses for testing)
INSERT INTO user_books (book_id, status, rating, current_page, started_at, finished_at) VALUES
('OL893415W', 'finished', 5, 658, '2024-01-15', '2024-02-20'),
('OL27482W', 'reading', 4, 150, '2024-11-01', NULL),
('OL1168083W', 'finished', 5, 328, '2024-03-01', '2024-03-15'),
('OL82563W', 'finished', 4, 309, '2024-04-01', '2024-04-10'),
('OL8479867W', 'reading', 5, 300, '2024-10-01', NULL),
('OL21745884W', 'to_read', NULL, 0, NULL, NULL),
('OL17352669W', 'finished', 4, 416, '2024-05-01', '2024-05-20'),
('OL10263W', 'finished', 5, 96, '2024-06-10', '2024-06-10'),
('OL66554W', 'to_read', NULL, 0, NULL, NULL),
('OL16239762W', 'finished', 4, 415, '2024-07-01', '2024-07-10');

-- ============================================================
-- MOVIES (TMDB - 10 verified entries)
-- ============================================================

INSERT INTO movies (id, title, director, poster_url, runtime, genres, release_date) VALUES
-- Inception (verified: 27205)
('27205', 'Inception', 'Christopher Nolan', 'https://image.tmdb.org/t/p/w500/aej3LRUga5rhgkmRP6XMFw3ejbl.jpg', 148, '["Science Fiction", "Action", "Thriller"]', '2010-07-16'),
-- The Dark Knight (verified: 155)
('155', 'The Dark Knight', 'Christopher Nolan', 'https://image.tmdb.org/t/p/w500/pyNXnq8QBWoK3b37RS6C3axwUOy.jpg', 152, '["Action", "Crime", "Drama"]', '2008-07-18'),
-- Interstellar (verified: 157336)
('157336', 'Interstellar', 'Christopher Nolan', 'https://image.tmdb.org/t/p/w500/1pnigkWWy8W032o9TKDneBa3eVK.jpg', 169, '["Science Fiction", "Drama", "Adventure"]', '2014-11-05'),
-- Parasite (verified: 496243)
('496243', 'Parasite', 'Bong Joon-ho', 'https://image.tmdb.org/t/p/w500/7hLSzZX2jROmEXz2aEoh6JKUFy2.jpg', 133, '["Thriller", "Comedy", "Drama"]', '2019-05-30'),
-- Spirited Away (verified: 129)
('129', 'Spirited Away', 'Hayao Miyazaki', 'https://image.tmdb.org/t/p/w500/12TAqK0AUgdcYE9ZYZ9r7ASbH5Q.jpg', 125, '["Animation", "Fantasy", "Family"]', '2001-07-20'),
-- Pulp Fiction (verified: 680)
('680', 'Pulp Fiction', 'Quentin Tarantino', 'https://image.tmdb.org/t/p/w500/4TBdF7nFw2aKNM0gPOlDNq3v3se.jpg', 154, '["Thriller", "Crime"]', '1994-09-10'),
-- The Matrix (verified: 603)
('603', 'The Matrix', 'The Wachowskis', 'https://image.tmdb.org/t/p/w500/pEoqbqtLc4CcwDUDqxmEDSWpWTZ.jpg', 136, '["Science Fiction", "Action"]', '1999-03-30'),
-- Forrest Gump (verified: 13)
('13', 'Forrest Gump', 'Robert Zemeckis', 'https://image.tmdb.org/t/p/w500/zi6RNYK1vXjIvpSBgjatXRcFYh2.jpg', 142, '["Drama", "Comedy", "Romance"]', '1994-07-06'),
-- Fight Club (verified: 550)
('550', 'Fight Club', 'David Fincher', 'https://image.tmdb.org/t/p/w500/t1i10ptOivG4hV7erkX3tmKpiqm.jpg', 139, '["Drama", "Thriller"]', '1999-10-15'),
-- The Shawshank Redemption (verified: 278)
('278', 'The Shawshank Redemption', 'Frank Darabont', 'https://image.tmdb.org/t/p/w500/t30GjttOdb5At1sYy8b3TOwFgWV.jpg', 142, '["Drama", "Crime"]', '1994-09-23');

-- User movie entries (varied statuses for testing)
INSERT INTO user_movies (movie_id, status, rating, watched_at) VALUES
('27205', 'watched', 5, '2024-02-14'),
('155', 'watched', 5, '2024-01-20'),
('157336', 'watched', 5, '2024-03-15'),
('496243', 'watched', 5, '2024-04-01'),
('129', 'watched', 5, '2024-05-10'),
('680', 'watched', 4, '2024-06-20'),
('603', 'watched', 5, '2024-07-05'),
('13', 'to_watch', NULL, NULL),
('550', 'watched', 4, '2024-08-15'),
('278', 'to_watch', NULL, NULL);

-- ============================================================
-- SHOWS (TMDB - 10 verified entries)
-- ============================================================

INSERT INTO shows (id, title, creators, poster_url, seasons_count, episodes_count, genres, first_air_date, status) VALUES
-- Breaking Bad (verified: 1396)
('1396', 'Breaking Bad', 'Vince Gilligan', 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', 5, 62, '["Drama", "Crime", "Thriller"]', '2008-01-20', 'Ended'),
-- Game of Thrones (verified: 1399)
('1399', 'Game of Thrones', 'David Benioff, D.B. Weiss', 'https://image.tmdb.org/t/p/w500/eRMfekBOnwyE9G0ffyEJIBOjX2n.jpg', 8, 73, '["Drama", "Fantasy", "Action"]', '2011-04-17', 'Ended'),
-- Stranger Things (verified: 66732)
('66732', 'Stranger Things', 'The Duffer Brothers', 'https://image.tmdb.org/t/p/w500/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg', 4, 34, '["Drama", "Fantasy", "Horror"]', '2016-07-15', 'Returning Series'),
-- The Witcher (verified: 71912)
('71912', 'The Witcher', 'Lauren Schmidt Hissrich', 'https://image.tmdb.org/t/p/w500/rhErSlk0M236rNFertVAZa9lz9S.jpg', 3, 24, '["Drama", "Fantasy", "Action"]', '2019-12-20', 'Returning Series'),
-- Arcane (verified: 94605)
('94605', 'Arcane', 'Christian Linke, Alex Yee', 'https://image.tmdb.org/t/p/w500/ypS7R36Vjcn51zZsXsta5onnaCo.jpg', 2, 18, '["Animation", "Action", "Fantasy"]', '2021-11-06', 'Ended'),
-- The Last of Us (verified: 100088)
('100088', 'The Last of Us', 'Craig Mazin, Neil Druckmann', 'https://image.tmdb.org/t/p/w500/4pMd9VAdqm96KA2W4X8yetgc7EF.jpg', 2, 17, '["Drama", "Action", "Adventure"]', '2023-01-15', 'Returning Series'),
-- Wednesday (verified: 119051)
('119051', 'Wednesday', 'Alfred Gough, Miles Millar', 'https://image.tmdb.org/t/p/w500/1UzED7WZJgzEIeVz1xiuZ1529nb.jpg', 2, 16, '["Comedy", "Mystery", "Fantasy"]', '2022-11-23', 'Returning Series'),
-- The Office US (verified: 2316)
('2316', 'The Office', 'Greg Daniels', 'https://image.tmdb.org/t/p/w500/2dApsoX4bd98szjrbj5i3syYOh2.jpg', 9, 201, '["Comedy"]', '2005-03-24', 'Ended'),
-- Friends (verified: 1668)
('1668', 'Friends', 'David Crane, Marta Kauffman', 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg', 10, 236, '["Comedy", "Drama"]', '1994-09-22', 'Ended'),
-- Dark (verified: 70523)
('70523', 'Dark', 'Baran bo Odar, Jantje Friese', 'https://image.tmdb.org/t/p/w500/vbG0zu0lIVDZZaUVOZuBIE9kno3.jpg', 3, 26, '["Drama", "Mystery", "Science Fiction"]', '2017-12-01', 'Ended');

-- User show entries (varied statuses for testing)
INSERT INTO user_shows (show_id, status, rating, current_season, current_episode, started_at, finished_at) VALUES
('1396', 'finished', 5, 5, 62, '2023-06-01', '2023-08-15'),
('1399', 'finished', 4, 8, 73, '2022-01-10', '2022-04-20'),
('66732', 'watching', 5, 4, 5, '2024-01-01', NULL),
('71912', 'watching', 4, 2, 5, '2024-09-01', NULL),
('94605', 'finished', 5, 2, 18, '2024-11-10', '2024-11-25'),
('100088', 'watching', 5, 1, 5, '2024-10-01', NULL),
('119051', 'to_watch', NULL, 1, 0, NULL, NULL),
('2316', 'finished', 4, 9, 201, '2023-01-01', '2023-05-01'),
('1668', 'finished', 4, 10, 236, '2022-06-01', '2022-12-01'),
('70523', 'to_watch', NULL, 1, 0, NULL, NULL);

-- ============================================================
-- SAMPLE REVIEWS
-- ============================================================

INSERT INTO reviews (media_type, media_id, comment, created_at) VALUES
('book', 'OL893415W', 'Un chef-d''oeuvre de la science-fiction. L''univers est incroyablement riche et les personnages sont fascinants.', '2024-02-21'),
('book', 'OL1168083W', 'Terrifiant et toujours aussi pertinent. Une lecture essentielle.', '2024-03-16'),
('movie', '27205', 'Un film visuellement epoustouflant avec un scenario complexe et captivant.', '2024-02-15'),
('movie', '496243', 'Une critique sociale brillante, drole et terrifiante a la fois.', '2024-04-02'),
('show', '1396', 'La meilleure serie que j''ai jamais vue. La transformation de Walter White est magistrale.', '2023-08-16'),
('show', '94605', 'Une animation sublime et une histoire profonde. Un veritable chef-d''oeuvre.', '2024-11-26');

-- ============================================================
-- SAMPLE GOALS
-- ============================================================

INSERT INTO goals (year, media_type, target) VALUES
(2024, 'book', 24),
(2024, 'movie', 52),
(2024, 'show', 12),
(2025, 'book', 30),
(2025, 'movie', 60),
(2025, 'show', 15);
