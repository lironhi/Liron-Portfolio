# Portfolio Liron Himbert - Documentation Technique Complète

## 📋 Vue d'ensemble du projet

Ce portfolio est une application web moderne construite avec une architecture **static-first, dynamic-ready**. L'objectif principal est de créer un site performant utilisant des fichiers statiques (MDX/JSON) tout en conservant la possibilité de migrer facilement vers une base de données sans refactorisation majeure.

### Objectifs principaux
- **Performance** : Génération statique pour des temps de chargement optimaux
- **Flexibilité** : Architecture modulaire permettant une migration facile vers une BDD
- **Accessibilité** : Respect des standards WCAG 2.1 AA
- **SEO** : Optimisation complète avec Open Graph et métadonnées
- **Évolutivité** : Code maintenable et extensible

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend Core
- **Next.js 15** avec App Router (dernière version stable)
- **React 19** avec les nouvelles fonctionnalités concurrentes
- **TypeScript** en mode strict pour la sécurité des types
- **Tailwind CSS 3.4** avec système de design personnalisé

#### Gestion de Contenu
- **Contentlayer** pour le traitement type-safe des fichiers MDX
- **MDX** pour les projets avec frontmatter riche
- **JSON** pour les données structurées (expérience, compétences, etc.)

#### Outils de Développement
- **Biome** : Linting et formatage ultra-rapide (remplace ESLint + Prettier)
- **TypeScript** : Vérification de types strict
- **Gray-matter** : Parsing des frontmatter MDX

#### Performance & SEO
- **@vercel/og** : Génération dynamique d'images Open Graph
- **Next.js Image** : Optimisation automatique des images
- **Lucide React** : Icônes modernes et légères

### Architecture des Données - Le Cœur du Système

#### Pattern Adapter Implémenté

```typescript
// Interface unifiée pour toutes les sources de données
interface DataProvider {
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getExperience(): Promise<Experience[]>;
  // ... toutes les méthodes nécessaires
}

// Implémentation actuelle (fichiers)
class FileSystemAdapter implements DataProvider {
  // Lecture des fichiers MDX et JSON
}

// Implémentation future (base de données)
class DatabaseAdapter implements DataProvider {
  // Requêtes SQL/NoSQL
}

// Point d'entrée unique
export const data: DataProvider = fsAdapter; // Changement en une ligne !
```

**Avantages de cette approche :**
- **Migration transparente** : Changer de source de données en modifiant une seule ligne
- **Testabilité** : Possibilité de mocker facilement les données
- **Cohérence** : Même interface pour toutes les pages
- **Évolutivité** : Ajout facile de nouvelles sources (API, GraphQL, etc.)

#### Types TypeScript Complets

Tous les types sont définis dans `lib/data/types.ts` :

```typescript
// Types principaux avec toutes les propriétés nécessaires
interface Project {
  slug: string;
  title: string;
  summary: string;
  year: number;
  tags: Tag[];
  links: Link[];
  highlights: string[];
  content?: string;
  coverImage?: string;
  featured?: boolean;
  status?: 'completed' | 'in-progress' | 'planning';
  // Métadonnées temporelles
  updatedAt?: string;
  createdAt?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string; // null = poste actuel
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  type: 'work' | 'internship' | 'freelance' | 'volunteer';
}

// ... autres types (Skill, Education, Certificate, etc.)
```

## 🗂️ Structure Détaillée du Projet

```
liron-portfolio/
├── app/                          # Pages Next.js (App Router)
│   ├── layout.tsx               # Layout racine avec navigation
│   ├── page.tsx                 # Page d'accueil
│   ├── globals.css              # Styles globaux + variables CSS
│   ├── projects/                # Pages projets
│   │   ├── page.tsx            # Liste des projets avec filtrage
│   │   └── [slug]/page.tsx     # Détail projet dynamique
│   ├── experience/page.tsx      # Parcours professionnel
│   ├── skills/page.tsx          # Compétences techniques
│   ├── education/page.tsx       # Formation et certifications
│   ├── about/page.tsx           # À propos personnel
│   ├── contact/page.tsx         # Contact et réseaux sociaux
│   ├── resume/page.tsx          # CV complet en ligne
│   └── api/og/route.ts         # API génération images OG
│
├── components/                   # Composants réutilisables
│   ├── Container.tsx            # Container responsive
│   ├── Section.tsx              # Sections de page avec titres
│   ├── Button.tsx               # Système de boutons complet
│   ├── Badge.tsx                # Badges pour tags/statuts
│   ├── ProjectCard.tsx          # Carte projet avec liens
│   ├── TimelineItem.tsx         # Item timeline expérience
│   ├── MDXContent.tsx           # Rendu MDX stylé
│   ├── Nav.tsx                  # Navigation responsive
│   ├── Footer.tsx               # Pied de page avec liens
│   ├── ThemeToggle.tsx          # Basculement dark/light
│   └── TagFilter.tsx            # Filtrage par tags (côté client)
│
├── lib/                         # Logique métier et utilitaires
│   ├── data/                    # Couche d'abstraction données
│   │   ├── types.ts            # Définitions TypeScript
│   │   ├── provider.ts         # Interface DataProvider
│   │   ├── fsAdapter.ts        # Adaptateur fichiers (actuel)
│   │   ├── dbAdapter.ts        # Adaptateur BDD (futur)
│   │   └── index.ts            # Point d'entrée unique
│   ├── contentlayer.ts         # Utilitaires Contentlayer
│   └── utils.ts                # Fonctions utilitaires
│
├── content/                     # Contenu MDX
│   └── projects/               # Projets en MDX
│       ├── example-ai-agent.mdx
│       ├── e-commerce-platform.mdx
│       └── data-visualization-dashboard.mdx
│
├── data/                        # Données JSON structurées
│   ├── site.json              # Configuration site
│   ├── experience.json         # Expériences professionnelles
│   ├── skills.json             # Compétences techniques
│   ├── education.json          # Formation académique
│   ├── certificates.json       # Certifications
│   └── pages.json              # Pages statiques
│
├── public/                      # Assets statiques
│   └── cv/                     # Fichiers CV
│       └── Liron-Himbert.pdf  # CV téléchargeable
│
├── Configuration                # Fichiers de configuration
├── package.json                # Dépendances et scripts
├── tsconfig.json               # Configuration TypeScript
├── tailwind.config.ts          # Configuration Tailwind
├── contentlayer.config.ts      # Configuration Contentlayer
├── next.config.ts              # Configuration Next.js
├── biome.json                  # Configuration Biome
├── postcss.config.js           # Configuration PostCSS
└── README.md                   # Documentation utilisateur
```

## 🎨 Système de Design

### Variables CSS Custom Properties

Le système de couleurs utilise des propriétés CSS personnalisées pour supporter le dark mode :

```css
:root {
  /* Mode clair */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  /* ... autres couleurs */
}

.dark {
  /* Mode sombre */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... surcharges dark mode */
}
```

### Composants Design System

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean; // Pour utilisation avec Link
}
```

#### Badge Component
```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

### Typographie et Responsive

- **Fonts** : Inter pour le texte, font mono pour le code
- **Breakpoints** : Mobile-first avec sm/md/lg/xl
- **Spacing** : Échelle cohérente basée sur Tailwind
- **Couleurs** : Palette harmonieuse avec support dark mode

## 📄 Gestion du Contenu

### Projets MDX

Chaque projet est un fichier MDX avec frontmatter riche :

```mdx
---
title: "AI-Powered Task Assistant"
summary: "Description courte du projet"
year: 2024
featured: true
status: "completed"
tags:
  - id: "react"
    name: "React"
    color: "#61DAFB"
  - id: "typescript"
    name: "TypeScript"
    color: "#3178C6"
links:
  - label: "GitHub Repository"
    url: "https://github.com/user/repo"
    type: "repo"
  - label: "Live Demo"
    url: "https://demo.vercel.app"
    type: "demo"
highlights:
  - "Fonctionnalité clé 1"
  - "Fonctionnalité clé 2"
updatedAt: "2024-01-15"
createdAt: "2023-12-01"
---

# Contenu du projet en Markdown

Texte riche avec **gras**, *italique*, `code`, etc.
```

### Données JSON Structurées

#### Expérience Professionnelle
```json
{
  "id": "unique-identifier",
  "company": "Nom de l'entreprise",
  "position": "Titre du poste",
  "startDate": "2022-03-01",
  "endDate": null, // null = poste actuel
  "location": "Paris, France",
  "type": "work", // work|internship|freelance|volunteer
  "description": "Description du poste",
  "achievements": [
    "Réalisation importante 1",
    "Réalisation importante 2"
  ],
  "technologies": ["React", "TypeScript", "Node.js"]
}
```

#### Compétences Techniques
```json
{
  "id": "javascript",
  "name": "JavaScript",
  "category": "languages", // languages|frameworks|tools|databases|cloud|other
  "level": "expert", // beginner|intermediate|advanced|expert
  "yearsOfExperience": 5,
  "description": "Description de l'expertise"
}
```

## 🚀 Fonctionnalités Avancées

### Génération d'Images Open Graph

L'API `/api/og/route.ts` génère dynamiquement des images OG :

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Titre par défaut';
  
  return new ImageResponse(
    (
      <div style={{ /* JSX pour l'image */ }}>
        <h1>{title}</h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### Filtrage Côté Client

Le composant `TagFilter` permet de filtrer les projets sans rechargement :

```typescript
const filteredProjects = useMemo(() => {
  if (selectedTags.length === 0) return projects;
  
  return projects.filter(project =>
    selectedTags.some(tagId =>
      project.tags.some(tag => tag.id === tagId)
    )
  );
}, [projects, selectedTags]);
```

### Dark Mode Persistant

```typescript
useEffect(() => {
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}, []);
```

## 📊 Performance et SEO

### Optimisations Performance

1. **Génération Statique** : Toutes les pages sont pré-générées
2. **Code Splitting** : Chargement automatique des composants
3. **Images Optimisées** : Composant Next.js Image avec WebP
4. **Lazy Loading** : Chargement différé des ressources

### SEO et Métadonnées

Chaque page a ses métadonnées optimisées :

```typescript
export async function generateMetadata({ params }: ProjectPageProps) {
  const project = await data.getProjectBySlug(params.slug);
  
  return {
    title: `${project.title} | Projects`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [generateOgImageUrl(project.title)],
    },
  };
}
```

### Accessibilité

- **ARIA Labels** : Tous les éléments interactifs sont étiquetés
- **Navigation Clavier** : Support complet du clavier
- **Contraste** : Respect des ratios WCAG AA
- **Screen Readers** : Structure sémantique HTML

## 🔧 Scripts et Workflow

### Scripts Disponibles

```json
{
  "dev": "next dev",                    // Serveur de développement
  "build": "contentlayer build && next build", // Build production
  "start": "next start",               // Serveur production
  "lint": "biome lint .",              // Linting
  "format": "biome format --write .",  // Formatage
  "typecheck": "tsc --noEmit",         // Vérification types
  "check": "biome check --write .",    // Lint + format
  "contentlayer": "contentlayer build" // Build MDX
}
```

### Processus de Build

1. **Contentlayer** traite les fichiers MDX
2. **TypeScript** compile les sources
3. **Next.js** génère les pages statiques
4. **Tailwind** purge les styles inutilisés

## 🚀 Migration vers Base de Données

### Étapes de Migration

1. **Créer l'adaptateur BDD** :
```typescript
class DatabaseAdapter implements DataProvider {
  async getProjects(): Promise<Project[]> {
    const result = await db.query('SELECT * FROM projects');
    return result.rows.map(mapToProject);
  }
  
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const result = await db.query(
      'SELECT * FROM projects WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ? mapToProject(result.rows[0]) : null;
  }
  
  // ... autres méthodes
}
```

2. **Changer le provider** :
```typescript
// lib/data/index.ts
import { dbAdapter } from './dbAdapter';
export const data: DataProvider = dbAdapter; // Une seule ligne !
```

3. **Mettre à jour la configuration** :
- Supprimer Contentlayer du `next.config.ts`
- Ajouter la connexion BDD
- Modifier les scripts de build

### Schéma de Base de Données Suggéré

```sql
-- Projets
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT,
  year INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  status project_status DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) -- Couleur hex
);

-- Relation projets-tags
CREATE TABLE project_tags (
  project_id INTEGER REFERENCES projects(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (project_id, tag_id)
);

-- Expériences
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = poste actuel
  location VARCHAR(255),
  description TEXT,
  type experience_type NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ... autres tables
```

## 🔍 Points d'Attention pour Reprise

### Données à Personnaliser

1. **`data/site.json`** : Informations personnelles, liens sociaux
2. **`data/experience.json`** : Parcours professionnel réel
3. **`data/skills.json`** : Compétences techniques actuelles
4. **`data/education.json`** : Formation et diplômes
5. **`data/certificates.json`** : Certifications obtenues
6. **`content/projects/`** : Projets réels avec contenu détaillé
7. **`public/cv/`** : CV PDF actuel

### Fonctionnalités à Étendre

1. **Blog** : Ajouter une section blog avec articles MDX
2. **Analytics** : Intégrer Google Analytics ou Vercel Analytics
3. **Newsletter** : Formulaire d'inscription
4. **Commentaires** : Système de commentaires sur les projets
5. **Recherche** : Moteur de recherche global
6. **i18n** : Support multilingue (français/anglais)

### Optimisations Futures

1. **PWA** : Transformer en Progressive Web App
2. **Offline** : Cache des contenus pour usage hors ligne
3. **API GraphQL** : Remplacer REST par GraphQL
4. **CMS** : Interface d'administration pour le contenu
5. **Tests** : Ajouter Jest + Cypress pour les tests
6. **Monitoring** : Sentry pour le monitoring d'erreurs

## 📚 Ressources et Documentation

### Documentation Technique
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Contentlayer](https://contentlayer.dev/docs)
- [Biome](https://biomejs.dev/guides/getting-started/)

### Inspiration Design
- [Vercel Design System](https://vercel.com/design)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

### Performance
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**Date de création** : Octobre 2024  
**Stack** : Next.js 15 + React 19 + TypeScript + Tailwind CSS + Contentlayer + Biome  
**Architecture** : Static-first, dynamic-ready avec pattern Adapter  
**Déploiement** : Optimisé pour Vercel  
**Migration** : Prêt pour base de données sans refactorisation majeure