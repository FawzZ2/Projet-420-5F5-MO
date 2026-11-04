DROP DATABASE IF EXISTS barberbook;
CREATE DATABASE barberbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barberbook;


CREATE TABLE utilisateurs (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nom       VARCHAR(255) NOT NULL,
  courriel  VARCHAR(255) NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(50)  NOT NULL,
  actif     TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT uq_courriel UNIQUE (courriel),
  CONSTRAINT ck_role CHECK (role IN ('client', 'barbier', 'admin'))
);

CREATE TABLE services (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(255)  NOT NULL,
  duree_min  INT           NOT NULL,
  prix       DECIMAL(6,2)  NOT NULL,
  CONSTRAINT ck_duree CHECK (duree_min > 0)
);


CREATE TABLE disponibilites (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  debut        DATETIME   NOT NULL,
  fin          DATETIME   NOT NULL,
  est_reserve  TINYINT(1) NOT NULL DEFAULT 0,
  barbier_id   INT        NOT NULL,
  CONSTRAINT fk_dispo_barbier FOREIGN KEY (barbier_id) REFERENCES utilisateurs(id),
  CONSTRAINT ck_plage CHECK (fin > debut)
);


CREATE TABLE rendezvous (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  statut            VARCHAR(50) NOT NULL DEFAULT 'confirme',
  date_creation     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_id         INT         NOT NULL,
  barbier_id        INT         NOT NULL,
  services_id       INT         NOT NULL,
  disponibilites_id INT         NOT NULL,
  CONSTRAINT fk_rdv_client  FOREIGN KEY (client_id)         REFERENCES utilisateurs(id),
  CONSTRAINT fk_rdv_barbier FOREIGN KEY (barbier_id)        REFERENCES utilisateurs(id),
  CONSTRAINT fk_rdv_service FOREIGN KEY (services_id)       REFERENCES services(id),
  CONSTRAINT fk_rdv_dispo   FOREIGN KEY (disponibilites_id) REFERENCES disponibilites(id),
  CONSTRAINT uq_disponibilite UNIQUE (disponibilites_id),
  CONSTRAINT ck_statut CHECK (statut IN ('confirme', 'annule', 'complete'))
);


CREATE TABLE avis (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  note           INT  NOT NULL,
  commentaire    TEXT,
  date_avis      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_id      INT  NOT NULL,
  rendezvous_id  INT  NOT NULL,
  CONSTRAINT fk_avis_client FOREIGN KEY (client_id)     REFERENCES utilisateurs(id),
  CONSTRAINT fk_avis_rdv    FOREIGN KEY (rendezvous_id) REFERENCES rendezvous(id),
  CONSTRAINT uq_rendezvous UNIQUE (rendezvous_id),
  CONSTRAINT ck_note CHECK (note BETWEEN 1 AND 5)
);


CREATE INDEX idx_dispo_recherche ON disponibilites (barbier_id, est_reserve, debut);