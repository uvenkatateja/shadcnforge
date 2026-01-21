#!/bin/bash

echo "🧪 Testing ShadcnForge API..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
echo ""

# Test registry list
echo "2. Testing registry list..."
curl -s http://localhost:3001/registry | jq .
echo ""

# Test upload (example)
echo "3. Testing upload endpoint..."
curl -s -X POST http://localhost:3001/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-button",
    "type": "registry:ui",
    "files": [{
      "path": "components/ui/button.tsx",
      "content": "export default function Button() { return <button>Click me</button>; }"
    }]
  }' | jq .
echo ""

echo "✅ API tests complete!"
