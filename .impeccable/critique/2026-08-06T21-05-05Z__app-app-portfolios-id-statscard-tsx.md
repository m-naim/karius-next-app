---
target: app/app/portfolios/[id]/StatsCard.tsx
total_score: 22
p0_count: 0
p1_count: 1
timestamp: 2026-08-06T21-05-05Z
slug: app-app-portfolios-id-statscard-tsx
---
Method: dual-agent (A: 0306f7cc-b1ac-45c5-a0e0-159806321735 · B: 24be7b4e-c2a8-4f23-ae47-5f973b9a6cdf)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:---:|-----------|
| 1 | Visibility of System Status | 2 | Horodatage statique ('N/A' en fallback), absence de statut live des marchés |
| 2 | Match System / Real World | 3 | Termes financiers naturels (FR), mais l'icône Cadena (`Lock`) sur un portefeuille *Public* viole le modèle mental |
| 3 | User Control and Freedom | 1 | Pas de switch entre format compact (1,2 M €) et précis, pas de masque de confidentialité |
| 4 | Consistency and Standards | 2 | Faute de frappe `vaiationColor` (prop), badges de variations dépareillés |
| 5 | Error Prevention | 3 | Vérifications défensives sur la valeur 0 / null (`pftData.totalValue || 0`) |
| 6 | Recognition Rather Than Recall | 3 | Bonnes étiquettes, manque d'infobulles explicatives pour les formules |
| 7 | Flexibility and Efficiency | 2 | Aucun raccourci interactif (clic horodatage sans effet, copier/masquer la valeur impossible) |
| 8 | Aesthetic and Minimalist Design | 2 | Enrobage boilerplate `<Card>` inutile, séparateur texte `\|` bricolé |
| 9 | Error Recovery | 2 | Statut 'N/A' passif sans mécanisme de ré-essai ni message explicatif |
| 10 | Help and Documentation | 2 | Absence d'aide contextuelle sur le rendement annuel ou le portefeuille public |
| **Total** | | **22/40** | **Acceptable** |

#### Anti-Patterns Verdict

**Verdict LLM** : Présence de boilerplate Shadcn (`<Card className="border-none bg-transparent shadow-none">`) qui alourdit le DOM inutilement. Le piratage CSS `break-all` sur les montants financiers tronque les chiffres de manière destructive sur écran mobile.

**Détecteur déterministe** : 0 violation syntaxique brute détectée par `detect.mjs`. La vérification manuelle confirme une faute de frappe critique dans la prop `vaiationColor={false}` (au lieu de `variationColor`).

#### Overall Impression
La hiérarchie visuelle est solide grâce à la typographie imposante (`text-6xl font-black`), mais le composant souffre d'incohérences de badges, d'un comportement tactile mobile handicapant (l'abréviation `1,45 M €` ne peut pas être dépliée sur mobile car le titre exact repose sur un survol `:hover`), et d'une métaphore visuelle contradictoire (`Lock` sur un portefeuille public).

#### What's Working
1. **Contraste & Ancrage Visuel** : La taille imposante (`text-6xl font-black`) donne une autorité immédiate à la valeur du portefeuille.
2. **Disposition Responsive Fluid** : Passage propre d'une colonne mobile (`flex-col`) à un alignement horizontal avec carte latérale sur desktop (`md:flex-row`).
3. **Formatage Dynamique des Devises** : Extraction automatique du symbole avec `Intl.NumberFormat` et abréviations financières françaises (`M €`, `Md €`).

#### Priority Issues

- **[P1] Rupture de ligne destructive sur le montant total (`break-all`)**
  - **Pourquoi** : La classe `break-all` découpe sauvagement les chiffres en deux lignes sur mobile (ex: `1 234 5` sur la ligne 1 et `67,89 €` sur la ligne 2).
  - **Fix** : Remplacer `break-all` par `truncate whitespace-nowrap` et ajuster les tailles réactives (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl`).
  - **Commande suggérée** : `/impeccable layout`

- **[P2] Icône Cadenas contradictoire sur les portefeuilles publics**
  - **Pourquoi** : Afficher `<Lock />` à côté du libellé « Portefeuille Public » génère une contradiction cognitive majeure.
  - **Fix** : Remplacer `Lock` par `Globe` ou `Eye` de `lucide-react`.
  - **Commande suggérée** : `/impeccable clarify`

- **[P3] Inaccessibilité du montant exact sur écran tactile / mobile**
  - **Pourquoi** : Le montant non abrégé repose uniquement sur `title={fullFormattedValue}`. Sur smartphone, le survol `title` ne fonctionne pas.
  - **Fix** : Rendre le montant cliquable ou intégrer un composant `<Tooltip>` accessible au toucher pour afficher les centimes exacts.
  - **Commande suggérée** : `/impeccable adapt`

- **[P3] Faute de frappe dans la prop & suppression de la couleur sur le rendement annuel**
  - **Pourquoi** : `vaiationColor={false}` (faute dans la prop) et désactivation du code couleur vert/rouge sur le rendement annuel.
  - **Fix** : Corriger la prop `variationColor` et réactiver le feedback visuel vert/rouge pour le rendement annuel.
  - **Commande suggérée** : `/impeccable colorize`

- **[P3] Boilerplate `<Card>` inutile et séparateur texte `|`**
  - **Pourquoi** : Enrobage DOM superflu et utilisation d'un caractère texte `|` au lieu d'un vrai `<Separator />`.
  - **Fix** : Retirer la carte transparente racine et utiliser `<Separator orientation="vertical" />`.
  - **Commande suggérée** : `/impeccable distill`

#### Persona Red Flags

* 🚩 **Alex (Power User)** : Impossible de cliquer sur le montant pour copier la valeur exacte ou afficher la précision au centime près.
* 🚩 **Jordan (Débutant)** : Troublé par la présence d'un cadenas (`Lock`) sur un portefeuille public et l'absence de couleur explicite sur le rendement annuel.
* 🚩 **Casey (Utilisateur Mobile)** : Les infobulles natives `:hover` ne s'affichent pas sur smartphone, bloquant l'accès au montant réel non abrégé.

#### Minor Observations
* Le fallback `pftData.last_perfs_update || 'N/A'` affiche du texte brut anglais `'N/A'` au lieu d'une indication explicite (« Non disponible »).
* Casse des titres légèrement hétérogène ("Valeur du portefeuille" vs "Performance Globale").

#### Questions to Consider
- *Pourquoi conserver une balise `<Card>` totalement transparente et sans bordure si ce n'est par habitude de boilerplate ?*
- *Comment un utilisateur mobile possédant 1 450 120 € peut-il consulter ses centimes si le survol `:hover` n'existe pas sur écran tactile ?*
- *Pourquoi associer un cadenas à la notion de transparence d'un portefeuille public ?*
