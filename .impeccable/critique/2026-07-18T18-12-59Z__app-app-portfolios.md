---
target: app/app/portfolios
total_score: 20
p0_count: 1
p1_count: 1
timestamp: 2026-07-18T18-12-59Z
slug: app-app-portfolios
---
Method: dual-agent (A: b54d72a5-489c-4af1-8722-0649f2cc2308 · B: 818bdd72-0ff3-4555-bb82-b2b76c66bf09)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Bons retours avec des `<Loader />` et toasts. |
| 2 | Match System / Real World | 3 | Vocabulaire financier bien intégré (PRU, Allocation). |
| 3 | User Control and Freedom | 2 | Navigation linéaire ; manque de raccourcis pour changer de portefeuille facilement. |
| 4 | Consistency and Standards | 1 | Casse de fichiers incohérente, mélange anglais/français, espacements variables. |
| 5 | Error Prevention | 1 | Formulaire "Nouveau Portefeuille" sans validation stricte. |
| 6 | Recognition Rather Than Recall | 3 | Affiche les noms et les symboles/icônes. |
| 7 | Flexibility and Efficiency | 2 | Filtrage texte très basique. |
| 8 | Aesthetic and Minimalist Design | 2 | Colonnes de tableaux surchargées de données juxtaposées. |
| 9 | Error Recovery | 2 | Les toasts d'erreur sont génériques ("Erreur") et non actionnables. |
| 10 | Help and Documentation | 1 | Manque de tooltips ou légendes pour le jargon technique. |
| **Total** | | **20/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM Assessment : High AI Slop Probability** 🤖
L'empreinte du modèle de langage est très visible à travers des conventions de nommage chaotiques (`camelCase` pour certains composants React, mots mixés comme `authentificated` et `addMouvement`). L'utilisation du français pour la copie de l'UI est brisée par des tournures douteuses ("voulez partage votre portefeuille en public?"). Le design se repose lourdement sur la structure de base des cartes shadcn, empilant de la logique de pagination manuelle plutôt que d'utiliser des primitifs standards.

**Deterministic scan :**
Le détecteur mécanique a trouvé 2 alertes (`border-accent-on-rounded`), mais ce sont des **faux positifs** (les classes `border-b-2 border-primary` sont liées aux loaders rotatifs `animate-spin`). Le scan automatisé est globalement propre (aucun gris "hard-coded" détecté grâce à nos passes de polish précédentes). L'analyse navigateur a été ignorée (codebase statique).

## Overall Impression
Le module fonctionne, ses états vides sont engageants et l'intégration SSE en temps réel offre une bonne expérience. Cependant, le côté "brouillon" du code (fautes, mélange de langues) et la surcharge cognitive de certains tableaux brident le côté professionnel de l'outil. C'est robuste sous le capot, mais rugueux en surface.

## What's Working
1. **Empty States Actionnables** : Les vues sans données incitent immédiatement l'utilisateur à l'action via de bons CTA ("Ajouter un actif", "Importer").
2. **Real-time SSE** : La mise à jour des portefeuilles en temps réel est une excellente pratique technique.
3. **Communauté "Explore"** : Un bel ajout qui dynamise et "gamifie" l'expérience globale.

## Priority Issues

- **[P0] Absence de validation de formulaire**
  - **What** : Le formulaire de création (`new/page.tsx`) permet de valider avec un nom vide.
  - **Why** : Corrompt les données et crée des erreurs non gérées côté serveur.
  - **Fix** : Bloquer le bouton "Créer" si l'input est vide et remonter des erreurs via React Hook Form / Zod.
  - **Suggested command** : `/impeccable harden app/app/portfolios/new`

- **[P1] Accessibilité brisée sur les filtres et le tableau**
  - **What** : Les sélecteurs temporels (1w, 1m) dans `[id]/page.tsx` n'ont aucun `aria-pressed`, tout comme les colonnes triables du tableau.
  - **Why** : Les utilisateurs de lecteurs d'écran naviguent à l'aveugle, sans savoir quel filtre est actif.
  - **Fix** : Remplacer l'implémentation manuelle par le composant `<Tabs>` natif de shadcn.
  - **Suggested command** : `/impeccable adapt app/app/portfolios/[id]/page.tsx`

- **[P2] Incohérence de nommage (camelCase React)**
  - **What** : Fichiers React nommés `portfolioCard.tsx`, `allocationPie.tsx`, `accountsMouvements.tsx`.
  - **Why** : Dette technique qui crée de la confusion dans les imports et signale un code généré non-relus.
  - **Fix** : Renommer en `PascalCase`.
  - **Suggested command** : `/impeccable harden app/app/portfolios/`

- **[P3] Surcharge Cognitive dans le Tableau**
  - **What** : `columns.tsx` empile Variation € et Variation % dans la même cellule.
  - **Why** : Rallonge le balayage visuel.
  - **Fix** : Séparer en colonnes masquables distinctes ou réduire drastiquement l'opacité d'une des deux données.
  - **Suggested command** : `/impeccable layout app/app/portfolios/[id]/columns.tsx`

## Persona Red Flags

**Alex (Power User)** : La recherche textuelle globale est très basique pour un utilisateur qui gère 50+ positions. L'impossibilité de filtrer par secteur rend la vue `[id]` trop plate.

**Jordan (First-Timer)** : La copie "voulez partage votre portefeuille en public?" n'est pas rassurante financièrement parlant. Des termes comme PRU sans aucune info-bulle vont causer de la friction ou le départ de l'utilisateur.

**Sam (Accessibility)** : La navigation via tabulation ("Tab") sur les filtres "1w", "1m" ne dit pas quel filtre est sélectionné.

## Minor Observations
- **Soupçon Linguistique** : Les variables en franglais (`authentificated`, `addMouvement`) sont légion.
- **Pagination Manuelle** : Une logique de type `Math.max(0, page - 1)` dans `explore/page.tsx` mériterait un refactor propre avec un hook de pagination.

## Questions to Consider
- Un graphique circulaire (Pie Chart) est-il la visualisation adéquate pour "Allocation" si l'utilisateur possède 40 actifs, générant un amas illisible de lignes colorées ?
- Faut-il assumer un jargon 100% expert ou faire de la pédagogie (tooltips) pour les termes boursiers ?
