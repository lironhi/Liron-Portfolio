# 🤖 Chatbot Quick Start Guide

## Ce qui a été créé

Ton portfolio a maintenant un chatbot AI qui peut répondre aux questions sur toi!

### Fichiers créés:

```
lib/chatbot/
├── knowledge-base.ts          # Informations personnelles et prompt système
├── portfolio-context.ts       # Récupération dynamique des données portfolio
├── suggested-questions.ts     # Questions suggérées
└── README.md                  # Documentation complète

app/api/chat/
└── route.ts                   # API endpoint pour le chatbot

components/
└── ChatBot.tsx                # Interface utilisateur du chat
```

## 🚀 Pour commencer

### Étape 1: Obtenir une clé API OpenAI

1. Va sur https://platform.openai.com/api-keys
2. Crée un compte (si tu n'en as pas)
3. Clique sur "Create new secret key"
4. Copie la clé (elle commence par `sk-...`)

### Étape 2: Configurer la clé API

Ouvre `.env.local` et remplace:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

Par ta vraie clé:

```bash
OPENAI_API_KEY=sk-ta-vraie-clé-ici
```

### Étape 3: Démarrer le serveur

```bash
npm run dev
```

### Étape 4: Tester

1. Ouvre http://localhost:3000
2. Clique sur le bouton de chat en bas à droite (💬)
3. Pose une question comme "Who are you?" ou "Tell me about your projects"

## ✨ Fonctionnalités

### Le chatbot peut:

- ✅ Répondre aux questions sur ton parcours
- ✅ Expliquer tes projets en détail
- ✅ Parler de tes compétences techniques
- ✅ Donner tes coordonnées de contact
- ✅ Répondre en français, anglais, ou hébreu
- ✅ Se souvenir du contexte de la conversation

### Exemples de questions:

```
"Who are you?"
"What are your main skills?"
"Tell me about your AI projects"
"What technologies do you use?"
"How can I contact you?"
"Can you work with Python?"
"Parle-moi de ton expérience" (en français!)
```

## 🎨 Personnalisation

### Modifier les informations personnelles

Édite `lib/chatbot/knowledge-base.ts`:

```typescript
export const personalInfo = {
  name: "Liron Himbert",
  bio: `Ton texte ici...`,
  // etc.
};
```

### Changer les questions suggérées

Édite `lib/chatbot/suggested-questions.ts`:

```typescript
export const quickReplies = [
  "Tes questions ici",
  "Question 2",
  // etc.
];
```

### Ajuster la personnalité

Dans `knowledge-base.ts`, modifie:

```typescript
export const personalInfo = {
  personality: {
    tone: "Professional yet friendly",
    traits: [
      "Tes traits de personnalité",
    ],
    funFacts: [
      "Tes anecdotes",
    ]
  }
};
```

## 💰 Coût

Le chatbot utilise `gpt-4o-mini` (modèle le moins cher d'OpenAI):

- ~0.001€ par question
- 1000 questions ≈ 1€
- Parfait pour commencer!

Pour réduire les coûts:
- Les questions similaires donnent des réponses similaires
- Le modèle est optimisé pour être économique
- Tu peux ajouter un cache pour les questions fréquentes

## 🚀 Déploiement sur Vercel

### Étape 1: Push sur GitHub

```bash
git add .
git commit -m "Add AI chatbot feature"
git push
```

### Étape 2: Configurer Vercel

1. Va sur https://vercel.com
2. Importe ton repo GitHub
3. Dans "Environment Variables", ajoute:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-ta-clé-api`
4. Déploie!

### Étape 3: Vérifier

Le chatbot fonctionnera automatiquement sur ton site en production!

## ⚠️ Important

### Avant de mettre en production:

1. ✅ Vérifie que toutes les infos dans `knowledge-base.ts` sont correctes
2. ✅ Teste avec différentes questions
3. ✅ Configure un budget sur OpenAI (pour éviter les surprises)
4. ✅ Ajoute `OPENAI_API_KEY` aux variables d'environnement Vercel
5. ✅ Ne commit JAMAIS ta clé API dans Git

### Sécurité:

- `.env.local` est déjà dans `.gitignore` ✅
- Les clés API ne sont jamais exposées au client ✅
- L'API route tourne en Edge Runtime sécurisé ✅

## 🔧 Dépannage

### "OpenAI API key not configured"

**Solution**:
1. Vérifie que `.env.local` contient `OPENAI_API_KEY=sk-...`
2. Redémarre le serveur (`npm run dev`)

### Le chatbot ne répond pas

**Solutions**:
1. Ouvre la console du navigateur (F12)
2. Regarde les erreurs
3. Vérifie que ta clé API OpenAI est valide
4. Vérifie ton solde OpenAI

### Mauvaises réponses

**Solutions**:
1. Mets à jour `knowledge-base.ts` avec les bonnes infos
2. Assure-toi que tes données portfolio sont à jour
3. Améliore le system prompt

## 📊 Prochaines étapes (optionnel)

Si tu veux améliorer le chatbot:

### Option 1: Ajouter LangGraph (avancé)

LangGraph permet des workflows complexes:
- Prise de décision multi-étapes
- Recherche web en temps réel
- Intégration avec d'autres APIs

### Option 2: Ajouter de la mémoire

Avec Redis ou une base de données:
- Se souvenir des conversations précédentes
- Personnaliser les réponses par utilisateur

### Option 3: Analytics

Tracker les questions posées pour:
- Savoir ce qui intéresse les visiteurs
- Améliorer le contenu du portfolio
- Optimiser les réponses

## 🆘 Besoin d'aide?

Si quelque chose ne fonctionne pas:

1. Lis `lib/chatbot/README.md` pour plus de détails
2. Vérifie les logs dans la console
3. Teste avec une simple question comme "Who are you?"
4. Assure-toi que les dépendances sont installées

## 🎉 C'est tout!

Ton chatbot est prêt! Il va:
- Répondre aux questions 24/7
- Représenter ton image professionnelle
- Impressionner les recruteurs et visiteurs
- Te faire économiser du temps en répondant aux questions fréquentes

Amuse-toi bien! 🚀
