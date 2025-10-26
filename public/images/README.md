# 📁 Organisation des Images

Ce dossier contient toutes les images statiques du portfolio, organisées par catégorie.

## Structure

```
images/
├── projects/          # Images des projets
├── profile/           # Photos de profil et banners
├── certificates/      # Images des certifications
├── logos/             # Logos d'entreprises et technologies
│   └── tech-stack/    # Logos des technologies utilisées
└── blog/              # Images pour articles (si applicable)
```

## 📌 Comment Utiliser les Images dans Next.js

### 1. Avec le composant `next/image` (RECOMMANDÉ)

```tsx
import Image from 'next/image';

// Image optimisée automatiquement
<Image
  src="/images/projects/mon-projet.jpg"
  alt="Description du projet"
  width={800}
  height={600}
  priority // Pour les images above-the-fold
/>
```

### 2. Avec une balise HTML classique

```tsx
<img
  src="/images/profile/avatar.jpg"
  alt="Photo de profil"
  className="rounded-full"
/>
```

## 🎨 Bonnes Pratiques

### Nommage des Fichiers
- Utilisez des noms descriptifs en **kebab-case**
- Exemples: `ai-security-analyzer.jpg`, `profile-banner.png`, `react-logo.svg`

### Formats Recommandés
- **Photos/Screenshots**: `.jpg` ou `.webp` (meilleure compression)
- **Logos/Icônes**: `.svg` (vectoriel, scalable)
- **Transparence**: `.png` ou `.webp`

### Optimisation
- Compressez les images avant de les ajouter
- Taille recommandée pour les projets: max 1920x1080px
- Taille recommandée pour les avatars: 400x400px

### Organisation par Projet
Pour les projets avec plusieurs images:
```
projects/
├── ai-security/
│   ├── cover.jpg
│   ├── screenshot-1.png
│   └── screenshot-2.png
└── portfolio/
    └── cover.jpg
```

## 🔗 Chemins d'Accès

Les images dans `public/` sont accessibles depuis la racine:
- `public/images/projects/demo.jpg` → `/images/projects/demo.jpg`
- `public/icons/logo.svg` → `/icons/logo.svg`

## 📝 Exemples d'Utilisation

### Image de Projet dans un Composant
```tsx
export function ProjectCard({ project }: Props) {
  return (
    <Image
      src={`/images/projects/${project.slug}.jpg`}
      alt={project.title}
      width={800}
      height={450}
      className="rounded-lg"
    />
  );
}
```

### Avatar dans le Header
```tsx
<Image
  src="/images/profile/avatar.jpg"
  alt="Liron Himbert"
  width={48}
  height={48}
  className="rounded-full"
/>
```

### Logo de Technologie
```tsx
<Image
  src="/images/logos/tech-stack/react.svg"
  alt="React"
  width={32}
  height={32}
/>
```

## 🚀 Optimisations Next.js

Next.js optimise automatiquement les images avec `next/image`:
- ✅ Lazy loading automatique
- ✅ Formats modernes (WebP, AVIF)
- ✅ Responsive images
- ✅ Placeholder blur
- ✅ Prevention du Cumulative Layout Shift (CLS)
