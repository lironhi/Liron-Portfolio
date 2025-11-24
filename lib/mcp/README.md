# MCP Tools Library

Ce dossier contient tous les outils MCP (Model Context Protocol) pour le chatbot du portfolio.

## Structure

```
lib/mcp/
├── index.ts              # Export central de tous les outils
└── tools/
    ├── portfolio-tools.ts # Outils d'accès aux données portfolio
    └── action-tools.ts    # Outils d'action et de navigation
```

## Outils Disponibles

### Portfolio Tools (7 outils)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `get_projects` | Récupère les projets | `featured?`, `tag?`, `limit?` |
| `get_project_details` | Détails d'un projet | `slug` (requis) |
| `get_skills` | Récupère les compétences | `category?`, `level?`, `search?` |
| `get_experience` | Expérience professionnelle | `type?`, `company?` |
| `get_education` | Parcours éducatif | aucun |
| `get_certificates` | Certifications | `activeOnly?` |
| `get_currently` | Activités actuelles | aucun |

### Action Tools (6 outils)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `prepare_contact` | URL contact pré-remplie | `subject?`, `message?` |
| `get_contact_info` | Infos de contact | aucun |
| `get_cv_download` | Liens CV | `language?` (en/fr/he) |
| `get_navigation` | Structure navigation | aucun |
| `search_portfolio` | Recherche globale | `query` (requis) |
| `recommend_projects` | Recommandations | `interest` (requis) |

## Utilisation

### Dans le serveur MCP

```typescript
import { registerAllTools } from '@/lib/mcp';

const handler = createMcpHandler((server) => {
  registerAllTools(server);
});
```

### Appeler un outil via MCP

```bash
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_projects",
      "arguments": {
        "featured": true,
        "limit": 3
      }
    }
  }'
```

## Ajouter un Nouvel Outil

### 1. Choisir le bon fichier

- **Portfolio data** → `portfolio-tools.ts`
- **Actions/Navigation** → `action-tools.ts`
- **Nouveau type** → Créer `new-tools.ts`

### 2. Définir l'outil

```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerMyTools(server: McpServer) {
  server.tool(
    'my_tool_name',           // Nom de l'outil
    'Description de l\'outil', // Description
    {
      param1: z.string().describe('Description param1'),
      param2: z.number().optional().describe('Description param2'),
    },
    async ({ param1, param2 }) => {
      try {
        // Logique de l'outil
        const result = await fetchData(param1, param2);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
```

### 3. Enregistrer dans index.ts

```typescript
import { registerMyTools } from './tools/my-tools';

export function registerAllTools(server: McpServer) {
  registerPortfolioTools(server);
  registerActionTools(server);
  registerMyTools(server); // Ajouter ici
}
```

## Types de Retour

Tous les outils retournent un objet avec cette structure :

```typescript
{
  content: [
    {
      type: 'text',
      text: string // JSON ou texte
    }
  ],
  isError?: boolean // Optionnel, pour les erreurs
}
```

## Validation Zod

Utilisez Zod pour valider les paramètres :

```typescript
{
  // String simple
  name: z.string(),

  // String optionnel avec description
  category: z.string().optional().describe('Filter by category'),

  // Number avec contraintes
  limit: z.number().int().min(1).max(100),

  // Enum
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),

  // Boolean
  featured: z.boolean(),
}
```

## Gestion d'Erreurs

Toujours wrapper dans try/catch et retourner `isError: true` :

```typescript
try {
  const data = await fetchData();
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
} catch (error) {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    ],
    isError: true
  };
}
```

## Tests

Tester vos outils avec curl :

```bash
# Lister tous les outils
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Appeler votre outil
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"your_tool_name",
      "arguments":{"param":"value"}
    }
  }'
```

## Bonnes Pratiques

1. **Nommage** : Utilisez `snake_case` pour les noms d'outils
2. **Descriptions** : Soyez précis et concis
3. **Paramètres** : Marquez les optionnels avec `.optional()`
4. **Erreurs** : Toujours gérer les cas d'erreur
5. **Performance** : Utilisez `Promise.all()` pour les appels parallèles
6. **Types** : Importez les types depuis `@/lib/data/types`
7. **Tests** : Testez tous les cas (succès, erreur, paramètres optionnels)

## Documentation

- [MCP Implementation](../../MCP_IMPLEMENTATION.md) - Documentation complète
- [Test Results](../../MCP_TEST_RESULTS.md) - Résultats des tests
- [MCP Spec](https://modelcontextprotocol.io/) - Spécification MCP officielle

---

**Maintenu par** : Liron Himbert
**Dernière mise à jour** : Novembre 2025
