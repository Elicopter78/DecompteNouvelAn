# Décompte du Nouvel An

Site web responsive qui affiche le compte à rebours jusqu'au prochain Nouvel An, puis un message de célébration le 1er janvier. Un compteur indique le nombre de visiteurs uniques estimé à l'aide d'un cookie.

## Technologies

- HTML, CSS et JavaScript
- Node.js et Express 5

## Prérequis

- Node.js 18 ou une version ultérieure
- npm

## Installation

```bash
npm install
cp .env.example .env
```

Le fichier `.env` fournit le port local (`3000` par défaut). Modifiez-y `PORT` pour choisir un autre port

## Développement

```bash
npm run dev
```

Le serveur démarre sur le port configuré (3000 par défaut). Ouvrez <http://localhost:3000>. `nodemon` redémarre le serveur après chaque modification.

## Démarrage

```bash
npm start
```

## Fonctionnement des cookies

Lorsqu'il interroge `/api/visitors`, le serveur pose le cookie propriétaire `countdown_visitor`. Il est limité au site, marqué `HttpOnly` et `SameSite=Lax`, et expire après un an. Il sert uniquement à éviter de recompter le même navigateur à chaque visite. Effacer ce cookie ou utiliser un autre navigateur peut donc compter une nouvelle visite. Aucun compte n'est nécessaire.

Les mentions légales et les informations relatives aux cookies sont disponibles sur le site, à la page « Mentions légales ».

## Fichiers principaux

- `server.js` : serveur Express et API du compteur
- `public/` : page, styles, script et favicon
- `visitors.json` : compteur local des visiteurs (généré à l'exécution)

## Contact

- E-mail : [contact@elie-dev.fr](mailto:contact@elie-dev.fr)
- Site : [elie-dev.fr](https://elie-dev.fr)
- GitHub : [@Elicopter78](https://github.com/Elicopter78)

## Licence

Ce projet est sous licence [GNU General Public License v3.0](./LICENSE).

## Intelligence Artificielle

**L'IA** a rédigé ce README, et il a été entièrement revu et corrigé par moi.

Elle a également développé certaines parties de ce site, là où je n'avais pas les compétences pour.