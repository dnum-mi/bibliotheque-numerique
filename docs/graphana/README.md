# Grafana Dashboards — Bibliothèque Numérique

Ce dossier contient les dashboards Grafana utilisés pour l’observabilité des applications **Bibliothèque Numérique**.

Les dashboards sont versionnés dans le dépôt afin de garantir leur **reproductibilité entre environnements**.

---

# Structure

grafana/
dashboards/
dev/
qualif/
preprod/
prod/

Chaque dossier contient les dashboards exportés depuis Grafana pour l’environnement correspondant.

Les dashboards sont identiques entre environnements, seule la **source de logs (containers)** change.

---

# Dashboards disponibles

### BN cokpit
Tous les infos intéressantes de l’API.
- tous les logs sans filtres
- toutes les requêtes HTTP sans les /health
- nombre de user différents
- nombre de requête par minutes (sans /health)
- nombre d'erreur
- logs des erreurs détaillés

### All errors
Tous les logs d'erreur d'api, de worker-file et de worker-sync
Principalement utilisé pour diagnostiquer les erreurs.

---

# Convention des couleurs

Les dashboards utilisent une convention visuelle commune.

## Niveau de log

| Level | Couleur   |
|------|-----------|
| error | rouge     |
| warn | orange    |
| log | vert      |
| debug | violet    |
| verbose | bleu ciel |

---

## Statut HTTP

| Status | Couleur |
|------|------|
| 2xx | vert |
| 4xx | orange |
| 5xx | rouge |

---

# Restaurer les dashboards

Dans Grafana :

1. Aller dans **Dashboards**
2. Cliquer sur **Import**
3. Importer le fichier JSON du dashboard souhaité
4. Sélectionner la datasource **Loki**

Les dashboards peuvent être importés directement.

---

# Bonnes pratiques

- Ne pas modifier directement les dashboards en production.
- Toute modification doit être **exportée puis commitée dans ce dossier**.
- Les dashboards doivent rester **identiques entre environnements** afin de faciliter le diagnostic.
