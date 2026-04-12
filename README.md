# Freelancers Plateforme Front

Frontend Angular de la plateforme microservices pour freelances. L'application fournit les interfaces de connexion, inscription, gestion de profil, administration des utilisateurs, portfolio, missions, contrats, reviews et chat temps reel.

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalites](#fonctionnalites)
- [Architecture du projet](#architecture-du-projet)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Lancement en local](#lancement-en-local)
- [Configuration des backends](#configuration-des-backends)
- [Routes principales](#routes-principales)
- [Commandes utiles](#commandes-utiles)
- [Build et deploiement Docker](#build-et-deploiement-docker)
- [Nginx et reverse proxy](#nginx-et-reverse-proxy)
- [Tests](#tests)
- [Depannage](#depannage)

## Stack technique

- Angular 18.2
- Angular CLI 18.2
- TypeScript 5.5
- RxJS 7.8
- Bootstrap 5.3
- Bootstrap Icons
- Socket.IO Client
- SweetAlert / SweetAlert2
- Signature Pad
- Nginx Alpine pour le deploiement
- Docker multi-stage build avec Node 22 puis Nginx

## Fonctionnalites

- Accueil public avec template Bootstrap et assets locaux.
- Authentification classique par email / mot de passe.
- Connexion par reconnaissance faciale.
- Gestion de session avec token stocke dans `localStorage`.
- Intercepteur HTTP qui ajoute automatiquement le header `Authorization: Bearer <token>`.
- Redirection vers `/login` quand une session utilisateur expire sur les endpoints du service User.
- Guard d'authentification pour les pages protegees.
- Guard admin pour les pages d'administration.
- Inscription utilisateur avec support JSON ou multipart avec fichier.
- Profil utilisateur connecte.
- Administration des utilisateurs : liste, creation, modification, detail, suppression.
- Gestion de portfolio : liste, ajout, modification, suppression, medias et analyse.
- Gestion des missions : creation, mise a jour, suppression, detail, liste par client et liste globale.
- Gestion des contrats : creation, liste, detail et signature.
- Reviews par mission, utilisateur emetteur et utilisateur destinataire.
- Chat temps reel via Socket.IO avec conversations et messages.

## Architecture du projet

```text
FrontEnd/
|-- angular.json                 # Configuration Angular CLI
|-- package.json                 # Scripts npm et dependances
|-- proxy.conf.json              # Proxy Angular dev server
|-- dockerfile                   # Build Docker multi-stage
|-- nginx.conf                   # Reverse proxy Nginx pour production
|-- public/                      # Assets publics copies au build
`-- src/
    |-- index.html
    |-- main.ts
    |-- styles.css
    |-- assets/                  # CSS, JS, images et vendors du template
    `-- app/
        |-- app-routing.module.ts
        |-- app.module.ts
        |-- components/          # Navbar, footer, home, chat widget
        |-- core/
        |   |-- constants/       # URLs API et cles de stockage
        |   |-- interceptors/
        |   `-- services/        # AuthService, UserService
        |-- features/
        |   |-- auth/            # Login, register, face login
        |   `-- user/            # Profil et admin users
        |-- guards/              # AuthGuard, AdminGuard
        |-- interceptors/        # JwtInterceptor
        |-- models/              # Modeles TypeScript
        |-- modules/             # Users, profile, mission, contrat, review, chat
        |-- portfolio/           # Module portfolio
        |-- services/            # Services metier
        `-- shared/              # Utilitaires partages
```

## Prerequis

- Node.js compatible avec Angular 18. Le Dockerfile utilise Node 22.
- npm.
- Angular CLI si vous voulez utiliser directement `ng` :

```bash
npm install -g @angular/cli
```

- Les microservices backend doivent etre demarres pour tester toutes les fonctionnalites.

## Installation

Depuis le dossier du frontend :

```bash
npm install
```

Le projet contient un `package-lock.json`, donc pour une installation reproductible en CI ou sur une nouvelle machine, vous pouvez utiliser :

```bash
npm ci
```

## Lancement en local

Demarrer l'application Angular :

```bash
npm start
```

Ou directement :

```bash
ng serve
```

L'application sera disponible sur :

```text
http://localhost:4200/
```

Le serveur de developpement utilise `proxy.conf.json`. Actuellement, ce proxy redirige :

| Chemin frontend | Backend local |
| --- | --- |
| `/profiles` | `http://localhost:8085` |
| `/nestjs` | `http://localhost:9091` |

## Configuration des backends

Les URLs principales sont declarees dans `src/app/core/constants/api.constants.ts` :

```ts
export const API_BASE_URL = 'http://localhost:8090/ProjetMicroUseryahya';
export const CHAT_API_BASE_URL = 'http://localhost:9091/api';
export const CHAT_SOCKET_URL = 'http://localhost:9091';
export const CHAT_SOCKET_PATH = '/socket.io';
```

D'autres services utilisent encore des URLs directes :

| Domaine | Fichier | URL locale |
| --- | --- | --- |
| User / Auth | `src/app/core/constants/api.constants.ts` | `http://localhost:8090/ProjetMicroUseryahya` |
| Chat API | `src/app/core/constants/api.constants.ts` | `http://localhost:9091/api` |
| Chat Socket.IO | `src/app/core/constants/api.constants.ts` | `http://localhost:9091/socket.io` |
| Portfolio / Profile | `src/app/portfolio/services/portfolio.service.ts` | `http://localhost:8085` |
| Missions | `src/app/services/mission.service.ts` | `http://localhost:8099/freelancerProject/mission` |
| Contrats | `src/app/services/contrat.service.ts` | `http://localhost:8084/api/contracts` |
| Reviews | `src/app/services/review.service.ts` | `http://localhost:8093/reviews` |
| Reviews WebSocket autocomplete | `src/app/modules/review/review.component.ts` | `ws://localhost:8093/ws/autocomplete` |

En local, verifiez que les microservices correspondants tournent bien sur ces ports, ou adaptez les URLs avant de lancer l'application.

## Routes principales

Routes declarees dans `src/app/app-routing.module.ts` :

| Route | Description | Protection |
| --- | --- | --- |
| `/home` | Page d'accueil | Public |
| `/login` | Connexion | Public |
| `/face-login` | Connexion par visage | Public |
| `/register` | Inscription | Public |
| `/profile` | Profil utilisateur connecte | `AuthGuard` |
| `/admin/users` | Liste admin des utilisateurs | `AdminGuard` |
| `/admin/users/new` | Creation admin d'un utilisateur | `AdminGuard` |
| `/admin/users/:id/edit` | Modification admin d'un utilisateur | `AdminGuard` |
| `/admin/users/:id` | Detail admin d'un utilisateur | `AdminGuard` |
| `/portfolio` | Liste portfolio | Public selon configuration actuelle |
| `/portfolio/add` | Ajout portfolio | Public selon configuration actuelle |
| `/portfolio/analysis` | Analyse portfolio | Public selon configuration actuelle |
| `/users` | Module users lazy-loaded | Public selon configuration actuelle |
| `/profiles` | Module profile lazy-loaded | Public selon configuration actuelle |
| `/missions` | Module mission lazy-loaded | Public selon configuration actuelle |
| `/contrats` | Module contrat lazy-loaded | Public selon configuration actuelle |
| `/reviews` | Module review lazy-loaded | Public selon configuration actuelle |
| `/chats` | Module chat lazy-loaded | Public selon configuration actuelle |

Sous-routes importantes :

| Module | Routes |
| --- | --- |
| Missions | `/missions`, `/missions/createMission`, `/missions/update/:id`, `/missions/allMissions` |
| Contrats | `/contrats`, `/contrats/all`, `/contrats/create`, `/contrats/:id` |
| Reviews | `/reviews`, `/reviews/mission/:id/details` |
| Chat | `/chats` |
| Users | `/users` |
| Profiles | `/profiles` |

## Commandes utiles

| Commande | Description |
| --- | --- |
| `npm start` | Lance Angular en mode developpement avec `ng serve` |
| `npm run build` | Genere le build Angular dans `dist/` |
| `npm run watch` | Build en watch avec configuration development |
| `npm test` | Lance les tests unitaires Karma/Jasmine |
| `npx ng generate component nom` | Genere un composant Angular |
| `npx ng generate service nom` | Genere un service Angular |
| `npx ng help` | Affiche l'aide Angular CLI |

## Build et deploiement Docker

Construire l'image Docker :

```bash
docker build -t freelancers-plateforme-front .
```

Lancer le conteneur :

```bash
docker run --rm -p 4200:80 freelancers-plateforme-front
```

L'application sera alors disponible sur :

```text
http://localhost:4200/
```

Le `dockerfile` utilise deux etapes :

1. Image `node:22` pour installer les dependances et builder l'application Angular.
2. Image `nginx:alpine` pour servir les fichiers statiques depuis `/usr/share/nginx/html`.

Pendant le build Docker, plusieurs URLs locales sont remplacees par des chemins relatifs compatibles avec Nginx et les containers backend, par exemple :

- `http://localhost:8090/ProjetMicroUseryahya` vers `/ProjetMicroUseryahya`
- `http://localhost:9091/api` vers `/api`
- `http://localhost:8084/api/contracts` vers `/api/contracts`
- `http://localhost:8093/reviews` vers `/api/reviews`
- `http://localhost:8099/freelancerProject/mission` vers `/freelancerProject/mission`
- `http://localhost:8085` vers `/api/profile`

## Nginx et reverse proxy

Le fichier `nginx.conf` sert l'application Angular et redirige les appels API vers les containers microservices.

Containers attendus par la configuration :

| Variable Nginx | Container cible |
| --- | --- |
| `$user_upstream` | `usercontainer:8090` |
| `$profile_upstream` | `profilecontainer:8085` |
| `$mission_upstream` | `missioncontainer:8099` |
| `$contract_upstream` | `contractcontainer:8084` |
| `$notification_upstream` | `notificationcontainer:8075` |
| `$review_upstream` | `reviewcontainer:8093` |
| `$chat_upstream` | `chatcontainer:3000` |
| `$faceid_upstream` | `faceidcontainer:5000` |
| `$aiskill_upstream` | `aiskillcontainer:8090` |
| `$gateway_upstream` | `apigatewaycontainer:9091` |

Principaux chemins proxifies :

| Chemin Nginx | Backend cible |
| --- | --- |
| `/ProjetMicroUseryahya/` | Service User |
| `/api/profile/` | Service Profile |
| `/api/portfolio/` | Service Profile / Portfolio |
| `/freelancerProject/` | Service Mission |
| `/api/contracts/` | Service Contract |
| `/api/notifications/` | Service Notification |
| `/api/reviews/` | Service Review |
| `/ws/autocomplete` | WebSocket Review |
| `/api/conversations/` | Service Chat |
| `/api/admin/` | Service Chat |
| `/api/users/` | Service Chat |
| `/socket.io/` | Socket.IO Chat |
| `/face-id/` | Service Face ID |
| `/ai-skill/` | Service AI Skill |
| `/nestjs/` | API Gateway NestJS |

La route fallback suivante permet a Angular de gerer le routing cote client :

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Tests

Lancer les tests unitaires :

```bash
npm test
```

Angular utilise Karma et Jasmine via la configuration `tsconfig.spec.json`.

## Depannage

### Page blanche ou erreur 404 apres refresh

Verifiez que le serveur utilise bien une fallback route vers `index.html`. C'est deja configure dans `nginx.conf` avec `try_files $uri $uri/ /index.html`.

### Erreurs CORS en local

Verifiez :

- que le backend accepte l'origine `http://localhost:4200` ;
- que les URLs dans `src/app/core/constants/api.constants.ts` et les services metier pointent vers les bons ports ;
- que `proxy.conf.json` contient les routes necessaires si vous voulez passer par le proxy Angular.

### Erreur 401 ou redirection vers login

Le token est stocke dans `localStorage` avec les cles suivantes :

- `user-service.token`
- `user-service.email`
- `user-service.role`
- `user-service.userId`

Si une session est invalide, supprimez ces cles dans le navigateur ou deconnectez-vous depuis l'application.

### Chat indisponible

Verifiez que :

- le backend chat est demarre ;
- `CHAT_API_BASE_URL` pointe vers la bonne API ;
- `CHAT_SOCKET_URL` et `CHAT_SOCKET_PATH` pointent vers le bon serveur Socket.IO ;
- en Docker, Nginx proxifie bien `/socket.io/` vers `chatcontainer:3000`.

### Images ou fichiers portfolio indisponibles

Verifiez que le service Profile / Portfolio est demarre sur `localhost:8085` en local, ou que le container `profilecontainer:8085` est accessible par Nginx en production Docker.

## Notes de contribution

- Respecter l'architecture actuelle par modules Angular non-standalone.
- Ajouter les modeles TypeScript dans `src/app/models`.
- Ajouter les appels HTTP dans un service dedie.
- Proteger les routes sensibles avec `AuthGuard` ou `AdminGuard`.
- Eviter de mettre de nouvelles URLs en dur dans les composants ; preferer un fichier de constantes ou un service de configuration.
- Lancer au minimum `npm run build` avant une livraison.
