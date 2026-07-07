# Site officiel — Commune de Tarmigt

Site web bilingue (français / arabe) pour la commune de Tarmigt, avec actualités et services administratifs, construit en **HTML / CSS / JavaScript** (frontend) et **Node.js + Express + MySQL** (backend).

## Structure du projet

```
tarmigt-commune/
├── server.js              # Point d'entrée du serveur Express
├── package.json
├── .env.example            # Modèle de variables d'environnement
├── config/
│   └── db.js               # Connexion MySQL (pool)
├── routes/
│   ├── actualites.js       # API des actualités
│   └── services.js         # API des services administratifs
├── db/
│   ├── schema.sql          # Création de la base et des tables
│   └── seed.sql            # Données d'exemple (FR + AR)
└── public/                 # Frontend statique
    ├── index.html           # Accueil
    ├── actualites.html       # Liste des actualités
    ├── services.html         # Liste des services
    ├── css/style.css
    └── js/{lang.js, main.js}
```

## Installation

### 1. Prérequis
- [Node.js](https://nodejs.org/) (v18 ou plus)
- [MySQL](https://www.mysql.com/) (v8 recommandé)

### 2. Cloner / copier le projet puis installer les dépendances
```bash
cd tarmigt-commune
npm install
```

### 3. Créer la base de données
```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

### 4. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Modifiez `.env` avec vos identifiants MySQL :
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=commune_tarmigt
```

### 5. Démarrer le serveur
```bash
npm start
# ou en mode développement (redémarrage automatique) :
npm run dev
```

Le site est accessible sur **http://localhost:3000**.

## API disponible

| Méthode | Endpoint              | Description                          |
|---------|------------------------|---------------------------------------|
| GET     | `/api/actualites`      | Liste des actualités (`?limit=`)      |
| GET     | `/api/actualites/:id`  | Détail d'une actualité                |
| GET     | `/api/services`        | Liste des services (`?categorie=`)    |
| GET     | `/api/services/:id`    | Détail d'un service                   |
| GET     | `/api/health`          | Vérifie que le serveur fonctionne     |

## Fonctionnalités
- Bascule de langue **Français / العربية** (avec passage automatique en RTL)
- Page d'accueil avec présentation de la commune et aperçus dynamiques
- Page **Actualités** listant les annonces depuis la base MySQL
- Page **Services** listant les démarches administratives, documents requis, délais et coûts
- Design responsive, sobre et identitaire (motif géométrique amazigh, palette terre/atlas)

## Pour aller plus loin
- Ajouter un espace d'administration (authentification + formulaires CRUD) pour gérer actualités et services sans passer par SQL directement.
- Ajouter un formulaire de contact / réclamations citoyennes relié à une table `messages`.
- Déployer sur un hébergeur Node.js (Render, Railway, VPS) avec une base MySQL managée.
