# ProFuel — SUD CONTRACTORS

Prototype cliquable de contrôle des flux carburant (GESTOCI → trajet → station).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Profils de test

| Profil | Rôle | PIN |
|---|---|---|
| Moussa Diabaté | Propriétaire (toutes stations) | 0000 |
| Awa Koné | Adjoint | 1111 |
| Jean-Baptiste Yao | Gérant Cocody | 2222 |
| Fatou Coulibaly | Superviseur Cocody | 3333 |
| Koffi Mensah | Pompiste Cocody | 4444 |
| Kouassi Jean | Chauffeur CI-4523-AB | 5555 |

Un sélecteur **Tester un rôle** reste disponible dans le bandeau.

## Workflows à tester

1. **Chaîne de livraison** — Missions → `MIS-2509-002` (commande) : identifier → empotage sonde GESTOCI → transit → simuler siphonnage → arrivée → dépoter compartiment → cuve → clôturer.
2. **Mission déjà en route** — `MIS-2409-014` (camion 7 compartiments, 45 000 L).
3. **Jauges** — ouverture / midi / minuit (PIN superviseur).
4. **Index pompes** — ouverture / clôture (PIN pompiste). La clôture diminue le stock cuve.
5. **Alertes** — visibles propriétaire / gérant / superviseur.

Données mock en `localStorage` (`sc-profuel-proto`). Bouton **Reset** pour revenir au jeu d’essai.

## Stack

Next.js · TypeScript · Tailwind v4 · Zustand · Leaflet · Recharts · Lucide
