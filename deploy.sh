#!/bin/bash
# =================================================================
# cineTrack Application Deployment Script
# Vercel (Frontend) + Railway (Backend) 自動デプロイ
# =================================================================

set -e  # エラー時に停止

echo "🚀 cineTrack デプロイメント開始..."

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 現在のディレクトリを確認
if [[ ! -f "docker-compose.yml" ]]; then
    echo -e "${RED}❌ cineTrackのルートディレクトリで実行してください${NC}"
    exit 1
fi

echo -e "${BLUE}📋 デプロイ前チェック...${NC}"

# Git状態確認
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  未コミットの変更があります。コミットを推奨します。${NC}"
    echo "続行しますか? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[yY]$ ]]; then
        echo "デプロイを中断しました。"
        exit 1
    fi
fi

# テスト実行
echo -e "${BLUE}🧪 テスト実行中...${NC}"

# バックエンドテスト
echo "  📊 バックエンドテスト..."
cd backend
if ! mvn test -q; then
    echo -e "${RED}❌ バックエンドテストが失敗しました${NC}"
    exit 1
fi
cd ..

# フロントエンドテスト
echo "  🎨 フロントエンドテスト..."
cd frontend
if ! npm test -- --coverage --watchAll=false --silent; then
    echo -e "${RED}❌ フロントエンドテストが失敗しました${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✅ 全テストが正常に完了しました${NC}"

# 本番ビルドテスト
echo -e "${BLUE}🔧 本番ビルドテスト...${NC}"

# フロントエンドビルド
cd frontend
if ! npm run build; then
    echo -e "${RED}❌ フロントエンドのビルドが失敗しました${NC}"
    exit 1
fi
cd ..

# バックエンドビルド
cd backend
if ! mvn clean package -DskipTests -q; then
    echo -e "${RED}❌ バックエンドのビルドが失敗しました${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✅ 本番ビルドが正常に完了しました${NC}"

# GitHubプッシュ
echo -e "${BLUE}📤 GitHubにプッシュ中...${NC}"
git add .
if [[ -n $(git status --porcelain) ]]; then
    git commit -m "deploy: prepare for Vercel + Railway deployment

- Add Vercel configuration (vercel.json)
- Optimize Docker for Railway deployment
- Add production environment variables template
- Update deployment documentation

🚀 Ready for production deployment"
fi

git push origin main

echo -e "${GREEN}✅ GitHubプッシュ完了${NC}"

echo ""
echo -e "${GREEN}🎉 デプロイ準備が完了しました！${NC}"
echo ""
echo -e "${BLUE}次のステップ:${NC}"
echo "1. Vercel (https://vercel.com) でアカウント作成・GitHub連携"
echo "2. Railway (https://railway.app) でアカウント作成・GitHub連携"
echo "3. 環境変数の設定 (.env.production を参考)"
echo ""
echo -e "${YELLOW}詳細手順は DEPLOYMENT.md を参照してください${NC}"