# Où retrouver les e-mails collectés

Les adresses saisies dans le pop-up de bienvenue et dans le formulaire du
footer ne sont stockées ni dans ce dépôt ni sur le serveur de la boutique.
Elles partent directement dans **la liste clients de Shopify**, via le
formulaire client natif de la boutique (`/contact`, `form_type=customer`).

C'est voulu : Shopify gère déjà le consentement, la désinscription et la
suppression sur demande (RGPD). Dupliquer les adresses ailleurs créerait un
deuxième fichier à sécuriser et à tenir à jour, pour rien.

## Les consulter

1. Ouvrir **admin.shopify.com** → boutique **reda studio**.
2. Menu de gauche → **Clients**.
3. Cliquer sur **Filtrer** → **Balise (tag)** → choisir `newsletter`.

La liste affichée est l'ensemble des inscrits, avec leur adresse e-mail et
leur date d'inscription.

## Savoir d'où vient chaque inscription

Chaque adresse reçoit deux balises :

| Balise               | Signification                          |
| -------------------- | -------------------------------------- |
| `newsletter`         | inscrit à la newsletter (toutes sources) |
| `newsletter-popup`   | inscrit via le pop-up de bienvenue     |
| `newsletter-footer`  | inscrit via le formulaire du footer    |

Filtrer sur `newsletter-popup` ou `newsletter-footer` permet de comparer ce
que rapporte chaque emplacement.

## Enregistrer la vue une fois pour toutes

Après avoir appliqué le filtre `newsletter`, cliquer sur **Enregistrer comme
segment** et le nommer par exemple « Newsletter ». Il apparaît ensuite en
permanence dans **Clients → Segments** : un seul clic pour revoir la liste,
sans refaire le filtre.

## Exporter la liste

Dans **Clients**, avec le filtre appliqué : bouton **Exporter** → *Clients
correspondant à votre recherche* → **CSV**. Le fichier arrive par e-mail et
s'ouvre dans Excel ou Google Sheets.

## Envoyer un e-mail à cette liste

**Marketing** → **Créer une campagne** → *Shopify Email*, puis choisir le
segment « Newsletter » comme destinataires. Le code promo distribué par le
pop-up est `REDA10`.

## Pourquoi pas une page « admin » sur le site ?

Une page qui listerait les e-mails devrait être publique (la boutique n'a pas
de système de connexion administrateur), ce qui exposerait le fichier clients
à n'importe quel visiteur. L'API Storefront utilisée par le site ne donne
d'ailleurs pas accès à la liste des clients — seule l'API Admin le permet, et
elle exige une clé secrète qui n'a rien à faire dans un dépôt public.
L'interface Shopify ci-dessus est l'outil prévu pour ça, et elle est déjà
protégée par le mot de passe du compte.
