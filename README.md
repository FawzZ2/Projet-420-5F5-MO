# BarberBook

Application web de prise de rendez-vous pour un salon de barbier.
Projet du cours 420-5F5-MO (Projet en developpement d'applications).

Equipe : Camil Boudjemline et Yassin Ibrahim

## Technologies

- Client : React + Vite (port 5173)
- Serveur : Node.js + Express (port 3000)
- Base de donnees : MySQL 8

## Fonctionnalites

**Client**
- S'inscrire, se connecter, se deconnecter
- Voir les barbiers avec leur note moyenne et les avis des autres clients
- Voir les creneaux libres d'un barbier pour un service et reserver
- Voir ses rendez-vous, annuler un rendez-vous a venir
- Evaluer un rendez-vous termine (note de 1 a 5 + commentaire)

**Barbier**
- Voir son horaire (rendez-vous a venir)
- Choisir son horaire de la semaine (jours travailles, heures, duree d'un creneau) :
  les creneaux des 4 prochaines semaines sont crees automatiquement
- Fermer une journee (conge), retirer un creneau, ajouter une plage en extra
- Voir ses evaluations et sa moyenne

**Proprietaire (admin)**
- Ajouter, modifier, retirer et reactiver des barbiers
- Ajouter, modifier et retirer des services

## Installation

### 1. Base de donnees

Dans MySQL Workbench, ouvrir et executer dans cet ordre :

1. `serveur/db/schema.sql` (cree la base `barberbook` et les tables)
2. `serveur/db/test.sql` (ajoute des donnees de test)

Attention : `schema.sql` supprime la base et la recree, donc toutes les donnees sont effacees.

### 2. Serveur

Creer un fichier `serveur/.env` (il n'est pas sur GitHub) :

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=barberbook
SESSION_SECRET=une_phrase_secrete
```

Puis dans un terminal :

```
cd serveur
npm install
node src/app.js
```

Le message `serveur demarre sur le port 3000` doit apparaitre.

### 3. Client

Dans un deuxieme terminal :

```
cd client
npm install
npm run dev
```

Ouvrir http://localhost:5173

## Comptes de test

Mot de passe pour tous les comptes : `Test1234`

| Role | Courriel |
|---|---|
| Proprietaire | admin@barberbook.ca |
| Barbier | marc@barberbook.ca |
| Barbier | sofiane@barberbook.ca |
| Client | client@test.ca |

Le client a deja un rendez-vous passe avec Marc qui n'est pas encore evalue (pour tester l'evaluation).

Marc travaille du mardi au samedi (9 h a 17 h, creneaux de 1 h) et Sofiane du lundi au vendredi
(10 h a 18 h, creneaux de 45 min). Leurs creneaux se creent tout seuls quand on ouvre le site.

## Regles importantes

- Deux clients ne peuvent pas reserver le meme creneau (transaction + `FOR UPDATE` + contrainte `UNIQUE`).
- On ne peut pas reserver ni ouvrir une plage dans le passe.
- Un client peut evaluer un rendez-vous seulement une fois et seulement quand il est termine.
- Un barbier qui a encore des rendez-vous a venir ne peut pas etre retire.
- Un service deja utilise dans un rendez-vous ne peut pas etre supprime.
- Changer son horaire de la semaine ne touche pas aux rendez-vous deja reserves.
- Le role est choisi par le serveur : une inscription cree toujours un client, seul l'admin cree des barbiers.

## Problemes frequents

- `Access denied for user` : mauvais mot de passe dans `.env`.
- `Unknown database 'barberbook'` : `schema.sql` n'a pas ete execute.
- `EADDRINUSE :::3000` : le serveur roule deja. Dans PowerShell : `Stop-Process -Name node -Force`
- La page affiche une erreur de connexion : verifier que le serveur roule dans l'autre terminal.
