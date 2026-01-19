# vue-project

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

---

# Installation et exécution du projet (Front + API + Base de données)

- **Prérequis**
  - Node.js 20+ (voir `package.json` engines)
  - MariaDB/MySQL local

- **Initialisation de la base de données**
  1. Démarrez votre serveur MariaDB/MySQL.
  2. Créez une base de données nommée `garde_manger`.
  3. Exécutez le script `table.sql` dans votre SGBD (via client SQL ou ligne de commande).
     - Crée l’utilisateur `admin1`/`1234` et la base/les tables (si droits adéquats),
     - Crée un utilisateur applicatif par défaut: `admin@example.com` avec mot de passe `1234`,
     - Insère des données d’exemple dans `foods`.

- **Configuration**
  cree un .env a l'aide du .envexemple

- **Lancer l’API (backend)**
  - Commande (dans ce dossier):
    ```sh
    node server/index.js
    ```
  - L’API écoute par défaut sur `http://localhost:5000`.

- **Lancer le front (Vite)**
  - Commande:
    ```sh
    npm run dev
    ```
  - Le front écoute sur `http://localhost:5173` (par défaut) et proxyfie `/api` vers `http://localhost:5000` (voir `vite.config.js`).

---


