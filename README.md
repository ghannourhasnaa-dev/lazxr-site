# LAZXR — Modélisation 3D pour la mode marocaine

> Un modèle 3D. Des possibilités infinies.

Site vitrine et configurateur 3D interactif pour [LAZXR](https://lazxr.com).

## Stack

- HTML / CSS / JavaScript (vanilla)
- [model-viewer](https://modelviewer.dev/) — affichage 3D interactif
- GLB models (CLO3D export)
- Netlify (hosting + CI/CD)

## Branching Strategy

```
feature/* → develop → preprod → main
              ↓          ↓        ↓
          Dev/Test    Review    Production
                    Preview    lazxr.com
```

- `main` — Production (déploie sur lazxr.com)
- `preprod` — Review avant production (URL preview Netlify)
- `develop` — Intégration des features (URL preview Netlify)
- `feature/*` — Branches de travail

## Déploiement

Le déploiement est automatique via Netlify :
- Push sur `main` → déploie lazxr.com
- Push sur `preprod` ou `develop` → crée une URL de preview

## Fichiers

| Fichier | Description |
|---------|-------------|
| `index.html` | Page unique du site |
| `DG100218.glb` | Modèle 3D polo (6.8 Mo) |
| `Hoodie_Thin.glb` | Modèle 3D hoodie (4.1 Mo) |
| `robots.txt` | Directives SEO |
| `sitemap.xml` | Sitemap pour Google |
| `netlify.toml` | Configuration Netlify |

## Contact

- **Site** : [lazxr.com](https://lazxr.com)
- **Email** : contact@lazxr.com
- **LinkedIn** : [LAZXR](https://www.linkedin.com/company/lazxr/)
