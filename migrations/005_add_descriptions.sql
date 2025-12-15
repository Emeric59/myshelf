-- ============================================================
-- Migration: Add descriptions to seed data
-- ============================================================
-- Adds synopsis/descriptions to books, movies, and shows

-- BOOKS DESCRIPTIONS
UPDATE books SET description = 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and expanding consciousness.' WHERE id = 'OL893415W';

UPDATE books SET description = 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep to whisk him away on an adventure.' WHERE id = 'OL27482W';

UPDATE books SET description = 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell''s nightmarish vision of a totalitarian world.' WHERE id = 'OL1168083W';

UPDATE books SET description = 'Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility. All he knows is a miserable life with the Dursleys.' WHERE id = 'OL82563W';

UPDATE books SET description = 'Told in Kvothe''s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen. From his childhood in a troupe of traveling players to years spent as a near-feral orphan in a crime-ridden city.' WHERE id = 'OL8479867W';

UPDATE books SET description = 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn''t know that. He can''t even remember his own name, let alone the nature of his assignment.' WHERE id = 'OL21745884W';

UPDATE books SET description = 'When nineteen-year-old huntress Feyre kills a wolf in the woods, a terrifying creature arrives to demand retribution. Dragged to a treacherous magical land she knows about only from legends, Feyre discovers that her captor is not truly a beast.' WHERE id = 'OL17352669W';

UPDATE books SET description = 'A pilot stranded in the desert meets a young prince fallen to Earth from a tiny asteroid. Their story reveals insights about life, human nature, love, and loneliness through seemingly simple yet deeply philosophical exchanges.' WHERE id = 'OL10263W';

UPDATE books SET description = 'Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. It depicts the emotional development of Elizabeth Bennet, who learns the error of making hasty judgments.' WHERE id = 'OL66554W';

UPDATE books SET description = 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne''s fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick''s wife disappears. Under mounting pressure from the police and media, Nick''s portrait of a blissful union begins to crumble.' WHERE id = 'OL16239762W';

-- MOVIES DESCRIPTIONS
UPDATE movies SET description = 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person''s idea into a target''s subconscious.' WHERE id = '27205';

UPDATE movies SET description = 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.' WHERE id = '155';

UPDATE movies SET description = 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.' WHERE id = '157336';

UPDATE movies SET description = 'All unemployed, Ki-taek''s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.' WHERE id = '496243';

UPDATE movies SET description = 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.' WHERE id = '129';

UPDATE movies SET description = 'The lives of two mob hitmen, a boxer, a gangster''s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.' WHERE id = '680';

UPDATE movies SET description = 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.' WHERE id = '603';

UPDATE movies SET description = 'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.' WHERE id = '13';

UPDATE movies SET description = 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town.' WHERE id = '550';

UPDATE movies SET description = 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an pointive warden.' WHERE id = '278';

-- SHOWS DESCRIPTIONS
UPDATE shows SET description = 'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live, he becomes filled with a sense of fearlessness and an unrelenting desire to secure his family''s financial future.' WHERE id = '1396';

UPDATE shows SET description = 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.' WHERE id = '1399';

UPDATE shows SET description = 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.' WHERE id = '66732';

UPDATE shows SET description = 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.' WHERE id = '71912';

UPDATE shows SET description = 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.' WHERE id = '94605';

UPDATE shows SET description = 'Joel and Ellie, a pair connected through the harshness of the world they live in, are forced to endure brutal circumstances and ruthless killers on a trek across post-pandemic America.' WHERE id = '100088';

UPDATE shows SET description = 'Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her emerging psychic ability, thwart a monstrous killing spree, and solve the supernatural mystery.' WHERE id = '119051';

UPDATE shows SET description = 'The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.' WHERE id = '2316';

UPDATE shows SET description = 'Six young people from New York City, on their own and struggling to survive in the real world, find the companionship, comfort and support they get from each other to be the perfect antidote to the pressures of life.' WHERE id = '1668';

UPDATE shows SET description = 'A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations in a small German town.' WHERE id = '70523';
