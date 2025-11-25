# État Actuel du Déploiement

**Dernière mise à jour** : 24 novembre 2025 - 18:30
**Dernier commit** : `5dd43a8`
**Status** : 🔄 En cours de résolution des erreurs de build

---

## 📊 Historique des Tentatives

### ✅ Problèmes Résolus

1. **Lockfile pnpm/npm** → Résolu
   - Supprimé `pnpm-lock.yaml`
   - Retiré la référence pnpm de `package.json`
   - Vercel utilise maintenant npm

2. **Schema Contentlayer** → Résolu
   - Ajouté champs `image` et `video` au schema Project
   - Les 14 documents MDX se génèrent correctement

3. **Erreur TypeScript MarkdownContent** → Résolu
   - Retiré l'import inexistant `PluggableList`
   - Utilisé `as any` pour les plugins

4. **remark-gfm dans contentlayer** → Résolu
   - Retiré `remarkGfm` de `contentlayer.config.ts`
   - Gardé uniquement dans le composant client `MarkdownContent.tsx`

### ⏳ Problèmes En Cours

#### **Erreur Principale : `this.getData is not a function`**

```
Error occurred prerendering page "/projects/ai-security-log-analyzer"
TypeError: this.getData is not a function
at Object.codeText (.next/server/app/projects/[slug]/page.js:2:366997)
```

**Tentatives de résolution** :
1. ❌ Downgrade `remark-gfm` v4 → v3.0.1 : Erreur persiste
2. ❌ Retirer `remark-gfm` de contentlayer : Erreur persiste
3. ❌ Overrides npm pour micromark packages : A causé erreur Zod
4. ❌ Override Zod explicite : N'a rien changé

**État actuel (commit `5dd43a8`)** :
- ✅ Pas d'overrides npm (retirés)
- ✅ `remark-gfm` v3.0.1 dans dependencies
- ✅ `remark-gfm` retiré de contentlayer config
- ⏳ En attente du résultat du build Vercel

---

## 🔍 Analyse du Problème

### **Hypothèses**

Le problème `getData is not a function` vient probablement de :

1. **Incompatibilité Contentlayer + Next.js 15**
   - Contentlayer n'a pas été mis à jour depuis longtemps
   - Next.js 15 utilise des versions récentes de packages MDX
   - Conflit entre les versions internes de Contentlayer et celles de Next.js

2. **Conflit micromark dans l'arbre de dépendances**
   - Plusieurs versions de `micromark-*` coexistent
   - Les plugins GFM utilisent des APIs incompatibles

3. **Problème spécifique aux projets MDX**
   - L'erreur se produit sur `/projects/ai-security-log-analyzer`
   - Possible contenu MDX problématique dans ce projet

### **Solutions Possibles**

#### **Option A : Investiguer le contenu MDX problématique**
- Vérifier `content/projects/ai-security-log-analyzer.mdx`
- Chercher des syntaxes GFM (tables, strikethrough, etc.)
- Simplifier le contenu pour identifier le problème

#### **Option B : Migrer de Contentlayer**
- Remplacer Contentlayer par `next-mdx-remote` ou `fumadocs-mdx`
- Plus de maintenance active
- Meilleur support pour Next.js 15

#### **Option C : Downgrade Next.js**
- Passer de Next.js 15 à Next.js 14
- Utiliser React 18 au lieu de React 19
- Solution de dernier recours

---

## 🎯 Prochaines Étapes

### **Étape 1 : Attendre le build actuel (commit `5dd43a8`)**

Si le build **réussit** :
- ✅ Tout fonctionne !
- Ajouter `GROQ_API_KEY` sur Vercel
- Déployer et tester

Si le build **échoue avec l'erreur `getData`** :
- Passer à l'Étape 2

### **Étape 2 : Vérifier le contenu MDX problématique**

```bash
# Lire le projet qui cause l'erreur
cat content/projects/ai-security-log-analyzer.mdx

# Chercher des syntaxes GFM
grep -E "\|.*\||\~\~|^- \[" content/projects/ai-security-log-analyzer.mdx
```

Si des tables GFM ou syntaxes complexes → Les simplifier temporairement

### **Étape 3 : Si rien ne marche, retirer temporairement le MCP**

Option nucléaire pour débloquer le déploiement :
1. Commenter temporairement `app/api/[transport]/route.ts`
2. Retirer `@modelcontextprotocol/sdk` et `mcp-handler`
3. Déployer le portfolio sans MCP
4. Réimplémenter le MCP plus tard avec une solution alternative

---

## 📦 Configuration Actuelle

### **package.json (versions clés)**

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0",
    "contentlayer": "^0.3.4",
    "mcp-handler": "^1.0.3",
    "next": "^15.0.0",
    "next-contentlayer": "^0.3.4",
    "react": "^19.0.0",
    "react-markdown": "^10.1.0",
    "rehype-raw": "^7.0.0",
    "remark-gfm": "^3.0.1",
    "zod": "3.23.8"
  }
}
```

### **contentlayer.config.ts**

```typescript
export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Project],
  mdx: {
    remarkPlugins: [],  // ← remark-gfm retiré
    rehypePlugins: [[rehypePrettyCode as any, rehypePrettyCodeOptions]],
  },
});
```

### **Build Command**

```bash
contentlayer build && next build
```

---

## 🐛 Logs d'Erreur Complets

### **Erreur contentlayer (warning non-bloquant)**

```
Generated 14 documents in .contentlayer
TypeError: The "code" argument must be of type number. Received an instance of Object
    at process.set [as exitCode] (node:internal/bootstrap/node:122:9)
    at Cli.runExit (/vercel/path0/node_modules/clipanion/lib/advanced/Cli.js:232:26)
```

**Note** : Cette erreur est un warning, Next.js continue le build malgré tout.

### **Erreur Next.js (bloquante)**

```
Error occurred prerendering page "/projects/ai-security-log-analyzer"
TypeError: this.getData is not a function
    at Object.codeText (.next/server/app/projects/[slug]/page.js:2:366997)
    at b.constructs (.next/server/app/projects/[slug]/page.js:2:121038)
    at b.parser (.next/server/app/projects/[slug]/page.js:2:122941)
Export encountered an error on /projects/[slug]/page
```

---

## 💡 Ressources

- [Next.js Prerender Error](https://nextjs.org/docs/messages/prerender-error)
- [Contentlayer GitHub Issues](https://github.com/contentlayerdev/contentlayer/issues)
- [MCP Handler Docs](https://github.com/modelcontextprotocol/mcp-handler)
- [Alternative: next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)

---

**Commit actuel en build** : `5dd43a8`
**En attente des résultats Vercel...**
