# Site Reflekt — reflektweb.com

Site vitrine de l'agence Reflekt (Célestin et Victor) : création de sites internet, visibilité Google et suivi mensuel.
Site statique en HTML, CSS et JavaScript, sans outil de construction : les fichiers se déposent tels quels chez l'hébergeur.

Version du 28/10/2026 (v37).

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `expertise/`, `offres/`, `suivi/`, `equipe/`, `labo/`, `questions/` | Les pages du site (chacune contient son `index.html`) |
| `mentions-legales/`, `confidentialite/` | Pages légales (non indexées par Google) |
| `404.html` | Page affichée quand une adresse n'existe pas |
| `assets/site.css` | Le design de tout le site |
| `assets/site.js` | Menu, formulaire de contact, Labo et animations |
| `assets/img/` | Les images |
| `sitemap.xml` | La liste des pages, à déclarer dans Google Search Console |
| `robots.txt` | Les consignes pour les robots de Google |
| `.gitignore` | Les fichiers que GitHub doit ignorer |

## Mettre à jour le site

1. Les modifications se font dans l'aperçu du site, puis un nouveau zip est généré.
2. Sur GitHub, remplacer les anciens fichiers par le contenu du zip (pas le zip lui-même), puis valider.
3. L'hébergeur publie la nouvelle version.

## Avant la mise en ligne

- Compléter les mentions légales une fois la SAS créée (raison sociale, SIREN, siège, nom de l'hébergeur).
- Déclarer le site et `sitemap.xml` dans Google Search Console.

## Sécurité

Aucun mot de passe, jeton ou clé d'accès ne doit être ajouté dans ce dépôt.
