# Prochaines Étapes - Déploiement Vercel

## ✅ Ce qui a été fait

1. **Code poussé sur GitHub** - Commit `444ae6e`
   - Suppression de `pnpm-lock.yaml` (obsolète)
   - Fix version `remark-gfm` (^4.0.1 → ^4.0.0)
   - Documentation de déploiement ajoutée

2. **Vercel va redéployer automatiquement**
   - Le push sur `main` déclenche le build
   - Vérifiez sur https://vercel.com/dashboard

---

## 🎯 À FAIRE MAINTENANT

### **Étape 1: Ajouter la Clé API sur Vercel**

⚠️ **IMPORTANT** : Sans cette étape, le chatbot ne fonctionnera pas !

1. Allez sur **https://vercel.com**
2. Ouvrez votre projet **Liron-Portfolio**
3. Cliquez sur **Settings** (onglet en haut)
4. Cliquez sur **Environment Variables** (menu gauche)
5. Cliquez sur **Add New**
6. Entrez :
   - **Key**: `GROQ_API_KEY`
   - **Value**: `[Utilisez votre clé API Groq]`
   - **Environment**: Cochez les 3 cases
     - ✅ Production
     - ✅ Preview
     - ✅ Development
7. Cliquez sur **Save**

**Note** : Vous devez utiliser votre propre clé API Groq (reçue précédemment). Ne partagez jamais cette clé publiquement.

### **Étape 2: Redéployer (si besoin)**

Si le build Vercel est **déjà terminé** avant que vous ajoutiez la clé :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Sélectionnez **Use existing Build Cache**
5. Cliquez sur **Redeploy**

**OU** attendez simplement que Vercel redéploie automatiquement après votre ajout de la variable.

---

## 🧪 Vérifications à Faire

### **1. Build Successful**

Vérifiez que le build Vercel se termine avec succès :

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**Pas d'erreur `ERR_PNPM_OUTDATED_LOCKFILE`** ✅

### **2. Test du Chatbot**

1. Ouvrez votre site : `https://liron-portfolio.vercel.app` (ou votre URL)
2. Cliquez sur l'icône chatbot (bas-droite)
3. Posez une question : **"Quels sont tes projets AI ?"**
4. Vérifiez que vous recevez une réponse (pas d'erreur)

### **3. Test du Serveur MCP**

Remplacez `YOUR_SITE` par votre URL Vercel :

```bash
curl -X POST "https://YOUR_SITE.vercel.app/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Résultat attendu** : Liste JSON avec 13 outils MCP

---

## 🐛 Si ça ne marche pas

### **Problème 1: Chatbot affiche "Sorry, I'm having trouble..."**

**Cause** : Variable `GROQ_API_KEY` manquante

**Solution** :
1. Vérifiez que vous avez ajouté la variable sur Vercel
2. Redéployez le projet
3. Attendez 2-3 minutes que le build se termine

### **Problème 2: Build échoue**

**Vérifiez les logs** :
1. Allez dans **Deployments**
2. Cliquez sur le déploiement en cours
3. Regardez les logs d'erreur

**Erreurs communes** :
- `Cannot find module 'mcp-handler'` → Redéployez avec cache cleared
- `ENOENT: no such file or directory` → Redéployez
- Timeout → Augmentez `maxDuration` dans `vercel.json`

### **Problème 3: MCP Server 404**

**Cause** : Route `[transport]` non reconnue

**Vérification** :
1. Assurez-vous que `app/api/[transport]/route.ts` existe
2. Testez avec `/api/mcp` au lieu de `/api/[transport]`

---

## 📊 Ce qui devrait être déployé

✅ **13 Outils MCP** :
1. `get_projects`
2. `get_project_details`
3. `get_skills`
4. `get_experience`
5. `get_education`
6. `get_certificates`
7. `get_currently`
8. `prepare_contact`
9. `get_contact_info`
10. `get_cv_download`
11. `get_navigation`
12. `search_portfolio`
13. `recommend_projects`

✅ **Chatbot AI** avec Groq (Llama 3.3 70B)

✅ **Context Dynamique** :
- Featured projects (top 3)
- Top skills (expert + advanced)
- Current experience
- Current activities

---

## 🎉 Une fois que tout marche

Testez ces questions dans le chatbot :

1. "Quels sont tes projets AI ?"
2. "Montre-moi tes compétences en Python"
3. "Quelle est ton expérience professionnelle ?"
4. "Comment puis-je te contacter ?"
5. "Recommande-moi un projet sur le web development"
6. "Où puis-je télécharger ton CV ?"

Le chatbot devrait répondre avec des données **réelles et à jour** de votre portfolio !

---

## 📝 Notes

- **Build Time** : 2-3 minutes
- **Chatbot Response** : 2-4 secondes
- **MCP Tools** : Temps réel (pas de cache)
- **Groq API** : Gratuit, rate limit généreux

---

**Créé le** : 24 novembre 2025
**Commit** : `444ae6e`
**Branch** : `main`
**Status** : ⏳ En attente de configuration Vercel
