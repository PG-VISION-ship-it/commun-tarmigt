-- Base de données : commune_tarmigt
-- Schéma MySQL pour le site de la Commune de Tarmigt


CREATE DATABASE IF NOT EXISTS commune_tarmigt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE commune_tarmigt;

-- ---------------------------------------------------------
-- Table : actualites
-- Actualités / annonces publiées par la commune
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS actualites (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre_fr          VARCHAR(255) NOT NULL,
  titre_ar          VARCHAR(255) NOT NULL,
  contenu_fr        TEXT NOT NULL,
  contenu_ar        TEXT NOT NULL,
  image_url         VARCHAR(500) DEFAULT NULL,
  date_publication  DATE NOT NULL,
  est_publie        TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date_publication (date_publication),
  INDEX idx_est_publie (est_publie)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : services
-- Démarches / services administratifs offerts par la commune
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom_fr                VARCHAR(255) NOT NULL,
  nom_ar                VARCHAR(255) NOT NULL,
  description_fr        TEXT NOT NULL,
  description_ar        TEXT NOT NULL,
  documents_requis_fr   TEXT,
  documents_requis_ar   TEXT,
  delai                 VARCHAR(100) DEFAULT NULL,   -- ex: "48 heures", "5 jours ouvrables"
  cout                  VARCHAR(100) DEFAULT NULL,   -- ex: "Gratuit", "20 DH"
  categorie             VARCHAR(100) DEFAULT NULL,   -- ex: "État civil", "Urbanisme"
  ordre_affichage       INT DEFAULT 0,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categorie (categorie)
) ENGINE=InnoDB;
