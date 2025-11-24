# MCP Server Implementation - Portfolio Chatbot

## Vue d'ensemble

Ce projet intègre un serveur **Model Context Protocol (MCP)** pour enrichir le chatbot AI avec un accès dynamique aux données du portfolio (projets, compétences, expérience, etc.).

## Architecture

### Composants MCP

```
lib/mcp/
├── index.ts                    # Export central
├── tools/
│   ├── portfolio-tools.ts      # Outils portfolio (projets, skills, experience)
│   └── action-tools.ts         # Outils d'action (contact, navigation, recherche)
app/api/
└── [transport]/
    └── route.ts                # Endpoint API MCP (dynamic routing)
```

### API Route MCP

**Endpoint**: `/api/mcp` (via dynamic `[transport]` route)
- Utilise `mcp-handler` de Vercel
- Compatible avec les serverless functions
- Supporte les transports HTTP et SSE
- Routing: `app/api/[transport]/route.ts`

## Outils MCP Disponibles

### 📂 Portfolio Tools

#### 1. `get_projects`
Récupère tous les projets avec filtrage optionnel.

**Paramètres**:
- `featured` (boolean, optionnel) - Filtrer par projets mis en avant
- `tag` (string, optionnel) - Filtrer par tag (ex: "React", "AI")
- `limit` (number, optionnel) - Limiter le nombre de résultats

**Exemple**:
```json
{
  "name": "get_projects",
  "arguments": {
    "featured": true,
    "limit": 3
  }
}
```

#### 2. `get_project_details`
Obtenir les détails complets d'un projet spécifique.

**Paramètres**:
- `slug` (string, requis) - Identifiant du projet

**Exemple**:
```json
{
  "name": "get_project_details",
  "arguments": {
    "slug": "covid19-information-system"
  }
}
```

#### 3. `get_skills`
Rechercher des compétences avec filtrage.

**Paramètres**:
- `category` (enum, optionnel) - `languages` | `frameworks` | `tools` | `databases` | `cloud` | `other`
- `level` (enum, optionnel) - `beginner` | `intermediate` | `advanced` | `expert`
- `search` (string, optionnel) - Rechercher par nom

**Exemple**:
```json
{
  "name": "get_skills",
  "arguments": {
    "category": "frameworks",
    "level": "expert"
  }
}
```

#### 4. `get_experience`
Récupérer l'expérience professionnelle.

**Paramètres**:
- `type` (enum, optionnel) - `work` | `internship` | `freelance` | `volunteer`
- `company` (string, optionnel) - Filtrer par entreprise

#### 5. `get_education`
Récupérer le parcours éducatif.

#### 6. `get_certificates`
Récupérer les certifications.

**Paramètres**:
- `activeOnly` (boolean, optionnel) - Montrer uniquement les certifications actives

#### 7. `get_currently`
Récupérer les activités actuelles (apprentissage, projets en cours, lectures, explorations).

### 🎯 Action Tools

#### 8. `prepare_contact`
Générer une URL de contact pré-remplie.

**Paramètres**:
- `subject` (string, optionnel) - Sujet de l'email
- `message` (string, optionnel) - Message pré-rempli

#### 9. `get_contact_info`
Récupérer les informations de contact et réseaux sociaux.

#### 10. `get_cv_download`
Obtenir les liens de téléchargement du CV.

**Paramètres**:
- `language` (enum, optionnel) - `en` | `fr` | `he`

#### 11. `get_navigation`
Récupérer la structure de navigation du site.

#### 12. `search_portfolio`
Rechercher dans tout le portfolio.

**Paramètres**:
- `query` (string, requis) - Terme de recherche

**Exemple**:
```json
{
  "name": "search_portfolio",
  "arguments": {
    "query": "Python"
  }
}
```

#### 13. `recommend_projects`
Recommander des projets basés sur un intérêt.

**Paramètres**:
- `interest` (string, requis) - Domaine d'intérêt (ex: "AI", "web development")

## Intégration avec le Chatbot

### Context Dynamique

Le chatbot charge automatiquement un context dynamique lors de chaque requête:
- **Projets featured** (top 3)
- **Top skills** (expert et advanced)
- **Expérience actuelle** (2 plus récentes)
- **Activités actuelles** (learning, working on)

**Fichier**: `app/api/chat/route.ts`

```typescript
async function getEnhancedSystemPrompt(): Promise<string> {
  const [projects, skills, experience, currently] = await Promise.all([
    data.getProjects(),
    data.getSkills(),
    data.getExperience(),
    data.getCurrently(),
  ]);

  // ... construit le context dynamique
  return systemPrompt + dynamicContext;
}
```

### Modèle LLM

- **Provider**: Groq API (gratuit et rapide)
- **Modèle**: Llama 3.3 70B Versatile
- **Température**: 0.7
- **Max Tokens**: 500

## Déploiement sur Vercel

### Variables d'environnement

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### Configuration Vercel

Le serveur MCP est automatiquement déployé comme serverless function par Next.js. Aucune configuration supplémentaire n'est requise.

## Test Local

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Tester le chatbot

Visitez `http://localhost:3000` et ouvrez le chatbot. Posez des questions comme:

- "Quels sont tes projets AI?"
- "Montre-moi tes compétences en Python"
- "Quelle est ton expérience professionnelle?"
- "Comment puis-je te contacter?"

### 3. Tester le serveur MCP

#### Option A: Avec curl

```bash
# Lister tous les outils
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Tester un outil (get_projects)
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_projects","arguments":{"featured":true,"limit":3}}}'

# Rechercher dans le portfolio
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_portfolio","arguments":{"query":"AI"}}}'
```

#### Option B: Avec MCP Inspector

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
```

Accédez à `http://127.0.0.1:6274` pour l'interface MCP Inspector.

## Utilisation avec Claude Code ou Cursor

Ajoutez cette configuration à votre fichier MCP:

```json
{
  "mcpServers": {
    "liron-portfolio": {
      "url": "https://your-portfolio.vercel.app/api/mcp"
    }
  }
}
```

## Avantages de cette Architecture

1. **Context Dynamique** ✅
   - Le chatbot accède aux vraies données en temps réel
   - Pas de données obsolètes hardcodées

2. **Économie de Tokens** ✅
   - Seules les données nécessaires sont chargées
   - Le context est construit dynamiquement

3. **Scalabilité** ✅
   - Serverless Vercel s'adapte automatiquement
   - Pas de serveur à gérer

4. **Extensibilité** ✅
   - Facile d'ajouter de nouveaux outils
   - Architecture modulaire

5. **Testabilité** ✅
   - MCP Inspector pour tester les outils
   - Types TypeScript pour la sécurité

## Prochaines Étapes

### Améliorations Possibles

1. **Analytics** 📊
   - Tracker les questions fréquentes
   - Stocker dans Redis/KV

2. **Cache** ⚡
   - Cacher les réponses fréquentes
   - Réduire les appels API

3. **OAuth** 🔒
   - Protéger certains outils MCP
   - Rate limiting par utilisateur

4. **Streaming** 📡
   - Réponses en temps réel
   - Meilleure UX

5. **Multi-modal** 🖼️
   - Support d'images dans les réponses
   - Captures d'écran de projets

## Technologies Utilisées

- **MCP SDK**: `@modelcontextprotocol/sdk`
- **MCP Handler**: `mcp-handler` (Vercel)
- **Validation**: `zod`
- **LLM Provider**: Groq API
- **Modèle**: Llama 3.3 70B
- **Framework**: Next.js 15
- **Déploiement**: Vercel Serverless

## Support

Pour toute question ou problème:
- **Issues**: [GitHub Issues](https://github.com/lironhi/portfolio/issues)
- **Email**: lironbenharrouch@gmail.com

---

**Implémenté par**: Liron Himbert
**Date**: Novembre 2025
**Version**: 1.0.0
