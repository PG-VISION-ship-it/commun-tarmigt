# Site officiel — Commune de Tarmigt

Site web bilingue (français / arabe) pour la commune de Tarmigt, avec actualités, services administratifs, chatbot IA et panneau d'administration. Construit en **HTML / CSS / JavaScript** (frontend) et **Node.js + Express + MySQL** (backend).

## Structure du projet

```
tarmigt-commune/
├── server.js              # Point d'entrée du serveur Express
├── package.json
├── vercel.json            # Configuration Vercel (serverless)
├── .env.example           # Modèle de variables d'environnement
├── api/
│   └── index.js           # Handler Vercel serverless
├── config/
│   └── db.js              # Connexion MySQL (pool)
├── middleware/
│   └── auth.js            # Middleware JWT + blacklist tokens
├── routes/
│   ├── actualites.js      # API publique des actualités
│   ├── services.js        # API publique des services
│   ├── admin.js           # API admin (CRUD, auth, stats)
│   └── chat.js            # API chatbot OpenAI
├── data/                  # Fallback JSON si MySQL indisponible
│   ├── actualites.json
│   ├── services.json
│   └── contacts.json
├── db/
│   ├── schema.sql         # Création de la base et des tables
│   └── seed.sql           # Données d'exemple (FR + AR)
├── uploads/               # Images uploadées (non versionnées)
└── public/                # Frontend statique
    ├── index.html         # Accueil (public)
    ├── actualites.html    # Liste des actualités
    ├── services.html      # Liste des services
    ├── contact.html       # Formulaire de contact
    ├── main.js            # Fonctions utilitaires JS
    ├── favicon.svg
    ├── tarmigt-logo.svg
    ├── css/
    │   ├── style.css      # Styles du site public
    │   └── chatbot.css    # Styles du chatbot
    ├── js/
    │   ├── lang.js        # Bilingual FR/AR pour le site public
    │   └── chatbot.js     # Widget chatbot
    └── admin/             # Panneau d'administration
        ├── index.html     # Tableau de bord avec graphiques
        ├── login.html     # Page de connexion
        ├── actualites.html # Gestion des actualités
        ├── services.html  # Gestion des services
        ├── messages.html  # Gestion des messages
        ├── users.html     # Gestion des utilisateurs
        ├── settings.html  # Paramètres + langue
        ├── profile.html   # Profil utilisateur
        ├── css/
        │   └── admin.css  # Styles du panneau admin
        └── js/
            ├── admin.js   # Core JS admin (auth, API, sidebar)
            ├── i18n.js    # Moteur d'internationalisation
            └── translations.js # Dictionnaire FR/AR complet
```

## Installation

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) v8+

### 2. Cloner et installer
```bash
git clone <repo-url>
cd tarmigt-commune
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Puis éditez `.env` avec vos identifiants :

| Variable | Description | Requis |
|----------|-------------|--------|
| `JWT_SECRET` | Secret pour les tokens JWT (générez un secret fort) | **Oui** |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Identifiants MySQL | **Oui** |
| `OPENAI_API_KEY` | Clé API OpenAI pour le chatbot | Non |
| `CLOUDINARY_URL` | URL Cloudinary pour les uploads d'images | Non |

Pour générer un JWT_SECRET :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Créer la base de données
```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

### 5. Démarrer le serveur
```bash
npm start
# ou en mode développement :
npm run dev
```

Le site est accessible sur **http://localhost:3000**.
L'administration est sur **http://localhost:3000/admin/login.html**.

## Connexion admin

Par défaut, le compte admin créé par `seed.sql` est :
- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

Changez le mot de passe immédiatement après la première connexion.

## API publique

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/actualites` | Liste des actualités (`?limit=`) |
| GET | `/api/actualites/:id` | Détail d'une actualité |
| GET | `/api/services` | Liste des services (`?categorie=`) |
| GET | `/api/services/:id` | Détail d'un service |
| POST | `/api/contact` | Envoyer un message de contact |
| POST | `/api/chat` | Chatbot IA |
| GET | `/api/health` | Vérification de santé |
| GET | `/api/settings` | Paramètres publics du site |

## API admin (JWT requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/admin/login` | Connexion (retourne un token JWT) |
| POST | `/api/admin/logout` | Déconnexion (blacklist le token) |
| GET | `/api/admin/me` | Profil de l'utilisateur connecté |
| GET | `/api/admin/stats` | Statistiques + données graphiques |
| GET/POST/PUT/DELETE | `/api/admin/actualites` | CRUD actualités |
| GET/POST/PUT/DELETE | `/api/admin/services` | CRUD services |
| GET/PUT/DELETE | `/api/admin/messages` | Gestion des messages |
| GET/POST/PUT/DELETE | `/api/admin/users` | Gestion des utilisateurs (admin) |
| PUT | `/api/admin/profile` | Modifier le profil |
| PUT | `/api/admin/profile/password` | Changer le mot de passe |
| GET/PUT | `/api/admin/settings` | Paramètres du site |
| GET/PUT | `/api/admin/language` | Préférence de langue |

## Fonctionnalités

### Site public
- Design responsive avec identité visuelle amazigh
- Bascule **Français / العربية** avec RTL automatique
- Pages : Accueil, Actualités, Services, Contact
- **Chatbot IA** alimenté par OpenAI (contexte de la commune)
- Formulaire de contact avec rate limiting

### Panneau d'administration
- Authentification JWT avec expiration 24h
- Tableau de bord avec **4 graphiques Chart.js** (actualités/services/messages par mois, services par catégorie)
- CRUD complet : actualités, services, messages, utilisateurs
- Système **bilingue FR/AR** complet avec 250+ traductions
- Sélecteur de langue dans les paramètres
- Support RTL pour l'arabe
- Protection rate limiting sur login et formulaires
- Upload d'images via Cloudinary

## Déploiement Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Le `vercel.json` gère automatiquement les routes API
4. Les fichiers statiques dans `public/` sont servis automatiquement

## Sécurité

- Tokens JWT avec blacklist en mémoire
- Rate limiting sur les endpoints sensibles
- Sanitisation de toutes les entrées utilisateur
- Helmet.js pour les headers de sécurité
- CSP configuré pour Chart.js et Google Fonts
- Bcrypt pour le hashage des mots de passe
- Validation côté serveur et côté client

## Licence

Commune de Tarmigt — Tous droits réservés.
