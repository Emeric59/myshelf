-- ============================================================
-- Migration: Correction des IDs Open Library des livres
-- Le seed initial avait des Work IDs complètement faux
-- ============================================================

-- Désactiver temporairement les contraintes de clé étrangère
PRAGMA foreign_keys = OFF;

-- 1. Mettre à jour user_books pour pointer vers les nouveaux IDs
UPDATE user_books SET book_id = 'OL893415W' WHERE book_id = 'OL45804W';      -- Dune
UPDATE user_books SET book_id = 'OL27482W' WHERE book_id = 'OL27479W';       -- The Hobbit
UPDATE user_books SET book_id = 'OL66554W' WHERE book_id = 'OL27448W';       -- Pride and Prejudice
-- OL1168083W (1984) est correct, pas de changement
UPDATE user_books SET book_id = 'OL17451527W' WHERE book_id = 'OL24187W';    -- The Little Prince
-- OL82563W (Harry Potter) est correct, pas de changement
UPDATE user_books SET book_id = 'OL8479867W' WHERE book_id = 'OL17930368W';  -- The Name of the Wind
UPDATE user_books SET book_id = 'OL3140822W' WHERE book_id = 'OL362427W';    -- To Kill a Mockingbird
UPDATE user_books SET book_id = 'OL5735363W' WHERE book_id = 'OL6990157W';   -- The Hunger Games
UPDATE user_books SET book_id = 'OL16239762W' WHERE book_id = 'OL15413843W'; -- Gone Girl

-- 2. Mettre à jour les reviews associées
UPDATE reviews SET media_id = 'OL893415W' WHERE media_type = 'book' AND media_id = 'OL45804W';
UPDATE reviews SET media_id = 'OL27482W' WHERE media_type = 'book' AND media_id = 'OL27479W';
UPDATE reviews SET media_id = 'OL66554W' WHERE media_type = 'book' AND media_id = 'OL27448W';
UPDATE reviews SET media_id = 'OL17451527W' WHERE media_type = 'book' AND media_id = 'OL24187W';
UPDATE reviews SET media_id = 'OL8479867W' WHERE media_type = 'book' AND media_id = 'OL17930368W';
UPDATE reviews SET media_id = 'OL3140822W' WHERE media_type = 'book' AND media_id = 'OL362427W';
UPDATE reviews SET media_id = 'OL5735363W' WHERE media_type = 'book' AND media_id = 'OL6990157W';
UPDATE reviews SET media_id = 'OL16239762W' WHERE media_type = 'book' AND media_id = 'OL15413843W';

-- 3. Mettre à jour les highlights associés
UPDATE highlights SET book_id = 'OL893415W' WHERE book_id = 'OL45804W';
UPDATE highlights SET book_id = 'OL27482W' WHERE book_id = 'OL27479W';
UPDATE highlights SET book_id = 'OL66554W' WHERE book_id = 'OL27448W';
UPDATE highlights SET book_id = 'OL17451527W' WHERE book_id = 'OL24187W';
UPDATE highlights SET book_id = 'OL8479867W' WHERE book_id = 'OL17930368W';
UPDATE highlights SET book_id = 'OL3140822W' WHERE book_id = 'OL362427W';
UPDATE highlights SET book_id = 'OL5735363W' WHERE book_id = 'OL6990157W';
UPDATE highlights SET book_id = 'OL16239762W' WHERE book_id = 'OL15413843W';

-- 4. Supprimer les anciens livres incorrects
DELETE FROM books WHERE id IN ('OL45804W', 'OL27479W', 'OL27448W', 'OL24187W', 'OL17930368W', 'OL362427W', 'OL6990157W', 'OL15413843W');

-- 5. Insérer les livres avec les bons IDs et covers
INSERT OR REPLACE INTO books (id, title, author, cover_url, description, page_count, published_date, language, genres) VALUES
('OL893415W', 'Dune', 'Frank Herbert', 'https://covers.openlibrary.org/b/id/11481354-M.jpg', 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.', 688, '1965', 'en', '["Science Fiction", "Fantasy"]'),
('OL27482W', 'The Hobbit', 'J.R.R. Tolkien', 'https://covers.openlibrary.org/b/id/14627509-M.jpg', 'Bilbo Baggins is a hobbit who enjoys a comfortable life, rarely traveling any farther than his pantry or cellar.', 310, '1937', 'en', '["Fantasy", "Adventure"]'),
('OL66554W', 'Pride and Prejudice', 'Jane Austen', 'https://covers.openlibrary.org/b/id/14348537-M.jpg', 'The romantic clash between Elizabeth Bennet and the proud Mr. Darcy.', 279, '1813', 'en', '["Romance", "Classic"]'),
('OL17451527W', 'The Little Prince', 'Antoine de Saint-Exupéry', 'https://covers.openlibrary.org/b/id/7605288-M.jpg', 'A poetic tale about a young prince who visits various planets in space.', 96, '1943', 'fr', '["Fiction", "Fantasy", "Children"]'),
('OL8479867W', 'The Name of the Wind', 'Patrick Rothfuss', 'https://covers.openlibrary.org/b/id/11480483-M.jpg', 'The tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.', 662, '2007', 'en', '["Fantasy", "Epic Fantasy"]'),
('OL3140822W', 'To Kill a Mockingbird', 'Harper Lee', 'https://covers.openlibrary.org/b/id/12606502-M.jpg', 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 281, '1960', 'en', '["Classic", "Fiction"]'),
('OL5735363W', 'The Hunger Games', 'Suzanne Collins', 'https://covers.openlibrary.org/b/id/12646537-M.jpg', 'In the ruins of a place once known as North America lies the nation of Panem, where the Capitol forces its districts to participate in the annual Hunger Games.', 374, '2008', 'en', '["Young Adult", "Dystopian", "Science Fiction"]'),
('OL16239762W', 'Gone Girl', 'Gillian Flynn', 'https://covers.openlibrary.org/b/id/8368314-M.jpg', 'On their fifth wedding anniversary, Amy Dunne disappears and suspicion falls on her husband Nick.', 415, '2012', 'en', '["Thriller", "Mystery"]');

-- 6. Mettre à jour les livres corrects avec les bonnes covers
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/9267242-M.jpg' WHERE id = 'OL1168083W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/10521270-M.jpg' WHERE id = 'OL82563W';

-- Réactiver les contraintes
PRAGMA foreign_keys = ON;
