-- Mot de passe de tous ces comptes : Test1234

USE barberbook;

INSERT INTO utilisateurs (nom, courriel, password, role) VALUES
('Proprietaire',   'admin@barberbook.ca',   '$2b$10$DjNB3ohX5ivrUprzcKKpLeUgEUZ5vbRuzP2mrloQiKR1xJ7kuiDNi', 'admin'),
('Marc Tremblay',  'marc@barberbook.ca',    '$2b$10$DjNB3ohX5ivrUprzcKKpLeUgEUZ5vbRuzP2mrloQiKR1xJ7kuiDNi', 'barbier'),
('Sofiane Benali', 'sofiane@barberbook.ca', '$2b$10$DjNB3ohX5ivrUprzcKKpLeUgEUZ5vbRuzP2mrloQiKR1xJ7kuiDNi', 'barbier'),
('Alex Client',    'client@test.ca',        '$2b$10$DjNB3ohX5ivrUprzcKKpLeUgEUZ5vbRuzP2mrloQiKR1xJ7kuiDNi', 'client');

INSERT INTO services (nom, duree_min, prix) VALUES
('Coupe',          30, 30.00),
('Barbe',          20, 20.00),
('Coupe et barbe', 45, 45.00),
('Contour',        15, 15.00);

INSERT INTO disponibilites (debut, fin, barbier_id) VALUES
(DATE_ADD(CURDATE(), INTERVAL '1 9'  DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '1 10' DAY_HOUR), 2),
(DATE_ADD(CURDATE(), INTERVAL '1 10' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '1 11' DAY_HOUR), 2),
(DATE_ADD(CURDATE(), INTERVAL '1 11' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '1 12' DAY_HOUR), 2),
(DATE_ADD(CURDATE(), INTERVAL '2 13' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '2 14' DAY_HOUR), 2),
(DATE_ADD(CURDATE(), INTERVAL '2 14' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '2 15' DAY_HOUR), 2),
(DATE_ADD(CURDATE(), INTERVAL '1 13' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '1 14' DAY_HOUR), 3),
(DATE_ADD(CURDATE(), INTERVAL '1 14' DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '1 15' DAY_HOUR), 3),
(DATE_ADD(CURDATE(), INTERVAL '3 9'  DAY_HOUR), DATE_ADD(CURDATE(), INTERVAL '3 10' DAY_HOUR), 3);

-- Rendez-vous deja passes, pour pouvoir tester les evaluations
-- (on peut pas reserver dans le passe avec le site, donc on les met ici)
INSERT INTO disponibilites (debut, fin, est_reserve, barbier_id) VALUES
(DATE_SUB(CURDATE(), INTERVAL 14 HOUR), DATE_SUB(CURDATE(), INTERVAL 13 HOUR), 1, 2),
(DATE_SUB(CURDATE(), INTERVAL 38 HOUR), DATE_SUB(CURDATE(), INTERVAL 37 HOUR), 1, 3),
(DATE_SUB(CURDATE(), INTERVAL 62 HOUR), DATE_SUB(CURDATE(), INTERVAL 61 HOUR), 1, 2);


INSERT INTO rendezvous (statut, client_id, barbier_id, services_id, disponibilites_id) VALUES
('complete', 4, 2, 1, 9),
('complete', 4, 3, 3, 10),
('complete', 4, 2, 2, 11);

INSERT INTO avis (note, commentaire, client_id, rendezvous_id) VALUES
(5, 'Tres bon degrade, je reviens c est sur', 4, 2),
(4, 'Bonne barbe, un peu d attente', 4, 3);
