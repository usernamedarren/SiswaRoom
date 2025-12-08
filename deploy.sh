#!/bin/bash

# SiswaRoom Docker Deployment Script for aPanel
# Run this from /www/SiswaRoom

set -e

echo "🔄 Deploying SiswaRoom..."
echo ""

# 1. Update from git
echo "📥 Pulling latest changes..."
git pull

# 2. Deploy Backend
echo ""
echo "🚀 Deploying Backend..."
cd /www/SiswaRoom/backend
docker compose down || true
docker compose up -d --build

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
sleep 10

# 3. Deploy Frontend with network
echo ""
echo "🚀 Deploying Frontend..."
cd /www/SiswaRoom/frontend
docker stop siswaroom-web || true
docker rm siswaroom-web || true

# Build frontend image
docker build -t siswaroom-frontend .

# Run frontend connected to siswaroom-net
docker run -d \
  -p 8088:80 \
  --network siswaroom-net \
  --name siswaroom-web \
  siswaroom-frontend

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Deployment Summary:"
echo "   Backend: http://siswaroom-backend:4000 (internal)"
echo "   Frontend: http://localhost:8088 (external)"
echo "   Domain: siswaroom.online (via Cloudflare tunnel)"
echo ""
echo "📊 Check backend logs: docker logs -f siswaroom-backend"
echo "📊 Check frontend logs: docker logs -f siswaroom-web"
