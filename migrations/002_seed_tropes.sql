-- ============================================================
-- MyShelf Database - Seed Tropes
-- ============================================================

-- Romance
INSERT OR IGNORE INTO tropes (name, slug, category) VALUES
('Enemies to Lovers', 'enemies-to-lovers', 'romance'),
('Friends to Lovers', 'friends-to-lovers', 'romance'),
('Fake Dating', 'fake-dating', 'romance'),
('Arranged Marriage', 'arranged-marriage', 'romance'),
('Second Chance Romance', 'second-chance', 'romance'),
('Slow Burn', 'slow-burn', 'romance'),
('Forbidden Love', 'forbidden-love', 'romance'),
('Love Triangle', 'love-triangle', 'romance'),
('Instalove', 'instalove', 'romance'),
('Grumpy x Sunshine', 'grumpy-sunshine', 'romance'),
('Forced Proximity', 'forced-proximity', 'romance'),
('Only One Bed', 'only-one-bed', 'romance'),
('He Falls First', 'he-falls-first', 'romance'),
('She Falls First', 'she-falls-first', 'romance'),
('Bodyguard Romance', 'bodyguard-romance', 'romance'),
('Boss/Employee', 'boss-employee', 'romance'),
('Age Gap', 'age-gap', 'romance'),
('Brothers Best Friend', 'brothers-best-friend', 'romance'),
('Best Friends Brother', 'best-friends-brother', 'romance');

-- Personnages
INSERT OR IGNORE INTO tropes (name, slug, category) VALUES
('Found Family', 'found-family', 'character'),
('Morally Grey Hero', 'morally-grey', 'character'),
('Villain Romance', 'villain-romance', 'character'),
('Strong Female Lead', 'strong-female-lead', 'character'),
('Cinnamon Roll Hero', 'cinnamon-roll', 'character'),
('Anti-Hero', 'anti-hero', 'character'),
('Unreliable Narrator', 'unreliable-narrator', 'character'),
('Dual POV', 'dual-pov', 'character'),
('Multiple POV', 'multiple-pov', 'character');

-- Intrigue
INSERT OR IGNORE INTO tropes (name, slug, category) VALUES
('Revenge Plot', 'revenge', 'plot'),
('Heist', 'heist', 'plot'),
('Tournament/Competition', 'tournament', 'plot'),
('Political Intrigue', 'political-intrigue', 'plot'),
('Mystery', 'mystery', 'plot'),
('Quest/Adventure', 'quest', 'plot'),
('Survival', 'survival', 'plot'),
('War', 'war', 'plot'),
('Rebellion', 'rebellion', 'plot');

-- Ambiance
INSERT OR IGNORE INTO tropes (name, slug, category) VALUES
('Dark Romance', 'dark-romance', 'mood'),
('Light/Fluffy', 'light-fluffy', 'mood'),
('Angst', 'angst', 'mood'),
('Hurt/Comfort', 'hurt-comfort', 'mood'),
('Spicy', 'spicy', 'mood'),
('Clean Romance', 'clean-romance', 'mood'),
('Slow Pace', 'slow-pace', 'mood'),
('Fast Pace', 'fast-pace', 'mood');

-- Thèmes sensibles
INSERT OR IGNORE INTO tropes (name, slug, category, is_sensitive) VALUES
('Cheating/Infidelity', 'cheating', 'sensitive', 1),
('Cliffhanger (pas de fin)', 'cliffhanger', 'sensitive', 1),
('Death of Main Character', 'main-character-death', 'sensitive', 1),
('Animal Death', 'animal-death', 'sensitive', 1),
('Child Death', 'child-death', 'sensitive', 1),
('SA/Abuse (on-page)', 'sa-abuse', 'sensitive', 1);

-- ============================================================
-- Seed Streaming Providers FR
-- ============================================================

INSERT OR IGNORE INTO streaming_subscriptions (provider_id, provider_name, provider_type, is_active) VALUES
('8', 'Netflix', 'video', 0),
('119', 'Amazon Prime Video', 'video', 0),
('337', 'Disney+', 'video', 0),
('381', 'Canal+', 'video', 0),
('350', 'Apple TV+', 'video', 0),
('531', 'Paramount+', 'video', 0),
('56', 'OCS', 'video', 0),
('283', 'Crunchyroll', 'video', 0),
('415', 'ADN', 'video', 0);
