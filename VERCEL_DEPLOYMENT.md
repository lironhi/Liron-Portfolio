# Guide de Déploiement Vercel - Portfolio avec MCP

## 🎯 Étapes de Déploiement

### **1. Connexion Vercel**

1. Allez sur **https://vercel.com**
2. Connectez-vous avec votre compte GitHub
3. Trouvez votre projet `Liron-Portfolio`

---

### **2. Configuration des Variables d'Environnement** ⚠️ IMPORTANT

Le chatbot nécessite la clé API Groq pour fonctionner.

#### **Sur Vercel Dashboard** :

1. Ouvrez votre projet sur Vercel
2. Allez dans **Settings** > **Environment Variables**
3. Ajoutez la variable suivante :

| Key | Value | Environment |
|-----|-------|-------------|
| `GROQ_API_KEY` | `your_groq_api_key_here` | Production, Preview, Development |

**Note**: Utilisez la clé API Groq que vous avez reçue. Ne la partagez jamais publiquement.

**⚠️ Cochez les 3 environnements** :
- ✅ Production
- ✅ Preview
- ✅ Development

#### **Screenshot Instructions** :

```
Settings → Environment Variables → Add New

┌─────────────────────────────────────────┐
│ Key:   GROQ_API_KEY                     │
│ Value: your_groq_api_key_here           │
│                                         │
│ Environment:                            │
│ ✅ Production                           │
│ ✅ Preview                              │
│ ✅ Development                          │
└─────────────────────────────────────────┘
         [Add Variable]
```

---

### **3. Redéployer le Projet**

Après avoir ajouté la variable d'environnement :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Sélectionnez **Use existing Build Cache** (plus rapide)
5. Cliquez sur **Redeploy**

**OU**

Poussez un nouveau commit (Vercel redéploie automatiquement) :

```bash
git commit --allow-empty -m "Trigger Vercel redeploy with MCP"
git push origin main
```

---

### **4. Vérifications Post-Déploiement**

Une fois le déploiement terminé :

#### **✅ Checklist**

| Test | URL | Statut |
|------|-----|--------|
| **Homepage** | `https://votre-site.vercel.app` | ⏳ À tester |
| **Chatbot UI** | Icône bas-droite | ⏳ À tester |
| **API Chat** | `/api/chat` | ⏳ À tester |
| **MCP Server** | `/api/mcp` | ⏳ À tester |
| **Projets** | `/projects` | ⏳ À tester |

#### **Test du Chatbot**

1. Ouvrez votre site déployé
2. Cliquez sur l'icône chatbot (bas-droite)
3. Posez une question : "Quels sont tes projets AI ?"
4. **Vérifiez** que vous recevez une réponse (pas d'erreur)

#### **Test du MCP Server**

```bash
# Remplacez YOUR_SITE par votre URL Vercel
curl -X POST "https://YOUR_SITE.vercel.app/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Résultat attendu** : Liste des 13 outils MCP

---

### **5. Logs de Débogage**

Si le chatbot ne fonctionne pas :

1. Allez dans **Deployments**
2. Cliquez sur le déploiement actif
3. Cliquez sur **View Function Logs**
4. Cherchez les erreurs dans `/api/chat`

**Erreurs communes** :

| Erreur | Solution |
|--------|----------|
| `GROQ_API_KEY not configured` | Ajoutez la variable d'environnement |
| `Module not found: mcp-handler` | Redéployez (dependencies manquantes) |
| `Cannot find module @modelcontextprotocol/sdk` | Redéployez avec cache cleared |

---

## 📦 Build Settings Vercel

**Framework Preset** : `Next.js`

**Build Command** :
```bash
contentlayer build && next build
```

**Output Directory** :
```
.next
```

**Install Command** :
```bash
npm install
```

**Node Version** : `18.x` (ou `20.x`)

---

## 🔒 Sécurité

### **Variables d'Environnement**

✅ `.env.local` est dans `.gitignore` (ne sera jamais commité)
✅ Les variables Vercel sont chiffrées
✅ Seuls les API routes côté serveur peuvent y accéder
✅ Jamais exposées au client

### **Clé API Groq**

- ✅ Gratuite (pas de paiement)
- ✅ Rate limit : généreux pour les tests
- ✅ Peut être regénérée sur https://console.groq.com/keys
- ⚠️ Ne la partagez jamais publiquement

---

## 🎉 URLs du Projet

**Repository GitHub** : https://github.com/lironhi/Liron-Portfolio

**Vercel Project** : À compléter après déploiement

**Live Site** : À compléter après déploiement

---

## 🆘 Besoin d'Aide ?

### **Vérifier le Statut Vercel**

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer manuellement
cd c:\Users\liron\Desktop\Projets\Liron-Portfolio
vercel
```

### **Voir les Logs en Temps Réel**

```bash
vercel logs YOUR_SITE.vercel.app --follow
```

---

## 📊 Métriques Attendues

| Métrique | Valeur Cible |
|----------|--------------|
| **Build Time** | 2-3 minutes |
| **First Load** | < 3 secondes |
| **Lighthouse Score** | 90+ |
| **Chatbot Response** | 2-4 secondes |

---

## ✨ Fonctionnalités Déployées

✅ **Next.js 15** avec App Router
✅ **React 19** avec Server Components
✅ **Chatbot AI** avec Groq (Llama 3.3 70B)
✅ **Serveur MCP** avec 13 outils
✅ **Context Dynamique** pour le chatbot
✅ **Animations** Framer Motion
✅ **Dark Mode** persistant
✅ **14 Projets** avec images/vidéos
✅ **42 Compétences** techniques
✅ **CV Multilingue** (FR/EN/HE)

---

**Créé le** : 24 novembre 2025
**Dernière mise à jour** : 24 novembre 2025
**Version** : 2.0 (avec MCP Server)
