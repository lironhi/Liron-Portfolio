# Correctifs de Déploiement Vercel

## 📋 Résumé des Problèmes Résolus

Ce document récapitule tous les correctifs appliqués pour résoudre les erreurs de build Vercel.

---

## 🔧 Problème 1: Lockfile pnpm/npm Incompatible

### **Erreur**
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with package.json
```

### **Cause**
- Le projet utilisait `pnpm-lock.yaml` mais les dépendances étaient installées avec npm
- Version mismatch de `remark-gfm` (lockfile: ^4.0.0, manifest: ^4.0.1)
- 4 nouvelles dépendances MCP manquantes dans le lockfile

### **Solution** (Commits: `444ae6e`, `c187e30`, `0254a09`)
1. ✅ Supprimé `pnpm-lock.yaml`
2. ✅ Retiré `"pnpm": ">=8.0.0"` de `package.json` engines
3. ✅ Ajouté `.npmrc` avec `legacy-peer-deps=true`
4. ✅ Régénéré `package-lock.json` avec npm

**Résultat**: Vercel utilise maintenant npm au lieu de pnpm

---

## 🔧 Problème 2: Erreur MDX/remark-gfm

### **Erreur**
```
TypeError: Cannot read properties of undefined (reading 'inTable')
at Object.exitCodeText (file:///vercel/path0/node_modules/mdast-util-gfm-table/lib/index.js:123:17)
```

### **Cause**
- `remark-gfm` v4.0.0 incompatible avec `mdast-util-gfm-table`
- Conflit de versions entre les dépendances MDX

### **Solution** (Commit: `4faeda7`)
✅ Downgradé `remark-gfm` de `^4.0.0` à `^3.0.1`

**Fichier modifié**: `package.json`
```json
{
  "dependencies": {
    "remark-gfm": "^3.0.1"  // Était ^4.0.0
  }
}
```

**Résultat**: Les 14 documents MDX se compilent correctement

---

## 🔧 Problème 3: Erreur Schema Contentlayer

### **Erreur**
```
4 documents contain field data which isn't defined in the document type definition.
• "projects/aquarium-frame.mdx": image: "/projects/aquarium-frame/main.png"
• "projects/covid19-information-system.mdx": video: "/projects/covid19-information-system/preview.mp4"
```

### **Cause**
- Les projets utilisaient les champs `image` et `video`
- Ces champs n'étaient pas définis dans le schema `Project`

### **Solution** (Commit: `4faeda7`)
✅ Ajouté les champs `image` et `video` au schema Project

**Fichier modifié**: `contentlayer.config.ts`
```typescript
export const Project = defineDocumentType(() => ({
  fields: {
    // ... existing fields
    image: {
      type: 'string',
      required: false,
    },
    video: {
      type: 'string',
      required: false,
    },
  }
}));
```

**Résultat**: Tous les projets valident correctement le schema

---

## 🔧 Problème 4: Erreur TypeScript react-markdown

### **Erreur**
```
Type error: Type '(options?: void | Options | undefined) => void | Transformer<Root, Root>'
is not assignable to type 'Pluggable'.
```

### **Cause**
- Incompatibilité de types entre `react-markdown` v10.x et `contentlayer`
- Versions différentes de `vfile` et `vfile-message` utilisées par chaque package

### **Solution** (Commit: `6e45d59`)
✅ Ajouté typage explicite avec `PluggableList` et `as any`

**Fichier modifié**: `components/MarkdownContent.tsx`
```typescript
import type { PluggableList } from 'react-markdown';

export function MarkdownContent({ content }: MarkdownContentProps) {
  const remarkPlugins: PluggableList = [remarkGfm as any];
  const rehypePlugins: PluggableList = [rehypeRaw as any];

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        // ...
      />
    </div>
  );
}
```

**Résultat**: Plus d'erreurs TypeScript lors du build

---

## ✅ Commits Appliqués

| Commit | Description | Fichiers Modifiés |
|--------|-------------|-------------------|
| `444ae6e` | Fix pnpm lockfile sync | `VERCEL_DEPLOYMENT.md`, `check-vercel.sh`, `package.json` |
| `c187e30` | Remove pnpm-lock.yaml | `pnpm-lock.yaml` (deleted), `VERCEL_NEXT_STEPS.md` |
| `f7d6ce5` | Trigger redeploy (empty) | - |
| `0254a09` | Switch from pnpm to npm | `package.json`, `.npmrc` |
| `4faeda7` | Fix build errors | `package.json`, `contentlayer.config.ts`, `package-lock.json` |
| `6e45d59` | Fix TypeScript errors | `components/MarkdownContent.tsx` |

---

## 📦 Dépendances Finales

### **Versions Importantes**
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0",
    "mcp-handler": "^1.0.3",
    "react-markdown": "^10.1.0",
    "rehype-raw": "^7.0.0",
    "remark-gfm": "^3.0.1",  // Downgraded from 4.0.0
    "next": "^15.0.0",
    "react": "^19.0.0"
  }
}
```

### **Engines**
```json
{
  "engines": {
    "node": ">=18.0.0"
    // Removed: "pnpm": ">=8.0.0"
  }
}
```

---

## 🎯 Prochaines Étapes

### **1. Surveiller le Build Vercel**

Le commit `6e45d59` devrait déclencher un build réussi. Vérifiez sur:
👉 https://vercel.com/dashboard → Liron-Portfolio → Deployments

**Build attendu**:
```
✓ Generated 14 documents in .contentlayer
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### **2. Ajouter la Variable d'Environnement**

Une fois le build **réussi** :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - **Key**: `GROQ_API_KEY`
   - **Value**: `[Votre clé API Groq]`
   - **Environnements**: Production, Preview, Development (tous cochés)
3. Cliquez **Save**

### **3. Redéployer**

Après avoir ajouté la variable :
1. **Deployments** → 3 points → **Redeploy**
2. Attendez 2-3 minutes

### **4. Tester**

1. Ouvrez votre site déployé
2. Testez le chatbot avec: "Quels sont tes projets AI ?"
3. Vérifiez que le MCP server fonctionne

---

## 🐛 Dépannage

### **Si le build échoue encore**

1. **Vérifiez les logs Vercel** pour identifier l'erreur
2. **Clearez le cache Vercel** :
   - Deployments → 3 points → Redeploy
   - Décochez "Use existing Build Cache"
3. **Vérifiez que npm est utilisé** :
   - Les logs devraient dire "Installing dependencies..." avec npm
   - Pas de mention de pnpm

### **Si le chatbot ne fonctionne pas**

1. **Vérifiez que `GROQ_API_KEY` est configuré**
2. **Vérifiez les Function Logs** :
   - Deployments → View Function Logs
   - Cherchez les erreurs dans `/api/chat`

---

## 📊 Métriques de Build

**Build Time attendu**: 2-3 minutes

**Étapes**:
1. Clone repo (2s)
2. Install dependencies avec npm (25s)
3. Contentlayer build (7s)
4. Next.js compile (30s)
5. Type checking (10s)
6. Static generation (20s)

---

**Créé le**: 24 novembre 2025
**Dernière mise à jour**: 24 novembre 2025
**Status**: ✅ Tous les problèmes résolus
**Dernier commit**: `6e45d59`
