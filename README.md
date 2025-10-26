# Liron Himbert Portfolio

A modern, static-first portfolio website built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Features a clean architecture with data adapters, making it easy to switch from file-based content to database-driven content in the future.

## 🚀 Features

- **Static-First Design**: Built with static generation for optimal performance
- **Dynamic-Ready Architecture**: Easy migration path to database-driven content
- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Content Management**: MDX for projects, JSON for structured data
- **SEO Optimized**: Open Graph images, metadata, and structured data
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Dark Mode**: Seamless dark/light theme switching
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Performance**: Optimized images, code splitting, and caching strategies

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Contentlayer** - Type-safe MDX processing
- **Lucide React** - Modern icon library

### Development Tools
- **Biome** - Fast linter and formatter
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates

### Deployment
- **Vercel** - Optimized for Next.js deployments
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Homepage
│   ├── projects/          # Projects pages
│   ├── experience/        # Experience page
│   ├── skills/            # Skills page
│   ├── education/         # Education page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── resume/            # Resume page
│   └── api/og/            # OG image generation
├── components/            # Reusable UI components
│   ├── Container.tsx      # Layout container
│   ├── Section.tsx        # Page sections
│   ├── Button.tsx         # Button component
│   ├── Badge.tsx          # Badge component
│   ├── ProjectCard.tsx    # Project card
│   ├── TimelineItem.tsx   # Experience timeline
│   ├── MDXContent.tsx     # MDX content renderer
│   ├── Nav.tsx            # Navigation
│   ├── Footer.tsx         # Footer
│   ├── ThemeToggle.tsx    # Dark mode toggle
│   └── TagFilter.tsx      # Project tag filter
├── lib/                   # Utilities and data layer
│   ├── data/              # Data abstraction layer
│   │   ├── types.ts       # Type definitions
│   │   ├── provider.ts    # Data provider interface
│   │   ├── fsAdapter.ts   # File system adapter (current)
│   │   ├── dbAdapter.ts   # Database adapter (future)
│   │   └── index.ts       # Data layer entry point
│   ├── contentlayer.ts    # Contentlayer utilities
│   └── utils.ts           # General utilities
├── content/               # MDX content files
│   └── projects/          # Project MDX files
├── data/                  # JSON data files
│   ├── site.json          # Site configuration
│   ├── experience.json    # Work experience
│   ├── skills.json        # Technical skills
│   ├── education.json     # Education history
│   ├── certificates.json  # Certifications
│   └── pages.json         # Static pages
├── public/                # Static assets
│   └── cv/                # Resume files
└── contentlayer.config.ts # Contentlayer configuration
```

## 🏗️ Architecture

### Data Layer Design

The project uses a flexible data layer that supports both file-based and database-driven content:

```typescript
// Data provider interface
interface DataProvider {
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getExperience(): Promise<Experience[]>;
  getSkills(): Promise<Skill[]>;
  // ... more methods
}

// Current implementation (file-based)
const data: DataProvider = fsAdapter;

// Future implementation (database)
// const data: DataProvider = dbAdapter;
```

This design allows switching from files to database with minimal code changes.

### Content Management

- **Projects**: Stored as MDX files in `content/projects/` with frontmatter metadata
- **Experience/Skills/Education**: Stored as JSON files in `data/` directory
- **Site Configuration**: Centralized in `data/site.json`

### Component Architecture

- **Atomic Design**: Components are built following atomic design principles
- **TypeScript**: All components are fully typed for better DX
- **Accessibility**: Components include proper ARIA attributes and keyboard support
- **Responsive**: Mobile-first design with responsive breakpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lironhimbert/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
pnpm typecheck    # Run TypeScript compiler
pnpm check        # Run all checks (lint + format)

# Content
pnpm contentlayer # Build Contentlayer content
```

## 📝 Content Management

### Adding Projects

Create a new MDX file in `content/projects/`:

```mdx
---
title: "My Amazing Project"
summary: "Brief description of the project"
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
  - label: "GitHub"
    url: "https://github.com/user/project"
    type: "repo"
  - label: "Live Demo"
    url: "https://project.vercel.app"
    type: "demo"
highlights:
  - "Key feature or achievement"
  - "Another important aspect"
---

# Project Details

Your project content in MDX format...
```

### Updating Experience

Edit `data/experience.json`:

```json
{
  "id": "unique-id",
  "company": "Company Name",
  "position": "Job Title",
  "startDate": "2023-01-01",
  "endDate": "2024-01-01", // or null for current
  "location": "City, Country",
  "type": "work", // work, internship, freelance, volunteer
  "description": "Job description",
  "achievements": ["Achievement 1", "Achievement 2"],
  "technologies": ["React", "TypeScript", "Node.js"]
}
```

### Customizing Site Information

Edit `data/site.json` to update:
- Personal information
- Social links
- SEO settings
- Navigation items

## 🎨 Customization

### Styling

The project uses Tailwind CSS with a custom design system:

- **Colors**: Defined in `tailwind.config.ts` using CSS custom properties
- **Typography**: Custom font stacks and sizing scale
- **Components**: Styled components in `components/` directory
- **Dark Mode**: CSS class-based dark mode with localStorage persistence

### Themes

Colors are defined using CSS custom properties for easy theme switching:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... dark mode overrides */
}
```

### Adding New Pages

1. Create page in `app/` directory
2. Add to navigation in `data/site.json`
3. Update data types if needed
4. Add any new data files

## 🔧 Migration to Database

To migrate from files to database:

1. **Implement database adapter**
   ```typescript
   // lib/data/dbAdapter.ts
   export class DatabaseAdapter implements DataProvider {
     async getProjects(): Promise<Project[]> {
       // Implement database queries
     }
     // ... implement other methods
   }
   ```

2. **Switch data provider**
   ```typescript
   // lib/data/index.ts
   import { dbAdapter } from './dbAdapter';
   export const data: DataProvider = dbAdapter;
   ```

3. **Update build process**
   Remove Contentlayer and update build scripts

## 📊 Performance

### Optimizations

- **Static Generation**: Pages are pre-built at build time
- **Image Optimization**: Next.js Image component with WebP support
- **Code Splitting**: Automatic code splitting for optimal bundle sizes
- **Lazy Loading**: Components and images load on demand
- **Caching**: Aggressive caching strategies for static content

### Monitoring

- **Core Web Vitals**: Monitored with Next.js analytics
- **Bundle Analysis**: Use `@next/bundle-analyzer` for bundle optimization
- **Performance Budgets**: Defined in CI/CD pipeline

## 🔒 Security

- **Content Security Policy**: Configured for XSS protection
- **HTTPS**: Enforced in production
- **Environment Variables**: Sensitive data stored securely
- **Dependencies**: Regular security audits with `pnpm audit`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Configure environment variables**
3. **Deploy automatically on push to main**

### Custom Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help:

- **Issues**: Create an issue on GitHub
- **Email**: liron.benharrouch@gmail.com
- **LinkedIn**: [linkedin.com/in/lironhimbert](https://linkedin.com/in/lironhimbert)

---

Built by [Liron Himbert](https://lironhimbert.dev)
