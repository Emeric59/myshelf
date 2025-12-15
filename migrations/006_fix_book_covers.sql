-- ============================================================
-- Migration: Correction des URLs de couverture des livres
-- ============================================================
-- Le format olid/OL...W ne fonctionne pas pour les couvertures
-- Il faut utiliser id/{cover_id}-M.jpg

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/6498519-M.jpg' WHERE id = 'OL45804W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/14627564-M.jpg' WHERE id = 'OL27479W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/14625765-M.jpg' WHERE id = 'OL27448W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/9267242-M.jpg' WHERE id = 'OL1168083W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/1452911-M.jpg' WHERE id = 'OL24187W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/10521270-M.jpg' WHERE id = 'OL82563W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/12539702-M.jpg' WHERE id = 'OL17930368W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/8257991-M.jpg' WHERE id = 'OL362427W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/12646537-M.jpg' WHERE id = 'OL6990157W';
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/id/8368314-M.jpg' WHERE id = 'OL15413843W';
