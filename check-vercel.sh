#!/bin/bash
# Script de vérification du déploiement Vercel

echo "🔍 Vérification du Déploiement Vercel"
echo "======================================="
echo ""

# Demander l'URL du site
read -p "Entrez votre URL Vercel (ex: https://liron-portfolio.vercel.app): " SITE_URL

echo ""
echo "📡 Test 1: Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [ "$STATUS" -eq 200 ]; then
    echo "✅ Homepage: OK ($STATUS)"
else
    echo "❌ Homepage: ERREUR ($STATUS)"
fi

echo ""
echo "📡 Test 2: API Chat (avec clé API)..."
CHAT_RESPONSE=$(curl -s -X POST "$SITE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hi"}]}')

if echo "$CHAT_RESPONSE" | grep -q "message"; then
    echo "✅ Chatbot API: OK"
    echo "   Réponse: $(echo $CHAT_RESPONSE | jq -r '.message' | head -c 50)..."
else
    echo "❌ Chatbot API: ERREUR"
    echo "   Réponse: $CHAT_RESPONSE"
fi

echo ""
echo "📡 Test 3: MCP Server..."
MCP_RESPONSE=$(curl -s -X POST "$SITE_URL/api/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}')

if echo "$MCP_RESPONSE" | grep -q "tools"; then
    TOOL_COUNT=$(echo "$MCP_RESPONSE" | grep -o '"name"' | wc -l)
    echo "✅ MCP Server: OK ($TOOL_COUNT outils détectés)"
else
    echo "❌ MCP Server: ERREUR"
    echo "   Réponse: $MCP_RESPONSE"
fi

echo ""
echo "📡 Test 4: Projects Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/projects")
if [ "$STATUS" -eq 200 ]; then
    echo "✅ Projects Page: OK ($STATUS)"
else
    echo "❌ Projects Page: ERREUR ($STATUS)"
fi

echo ""
echo "======================================="
echo "✨ Vérification terminée!"
echo ""
