#!/bin/bash

# CineTrack 開発環境セットアップスクリプト
# このスクリプトは新しい開発者が簡単に環境構築できるようにします

set -e  # エラーで停止

echo "🎬 CineTrack 開発環境セットアップを開始します..."
echo

# 1. 必要なツールの確認
echo "📋 必要なツールをチェック中..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker が必要です。https://docs.docker.com/get-docker/ からインストールしてください"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose が必要です"; exit 1; }
echo "✅ Docker と Docker Compose が利用可能です"
echo

# 2. .envファイルの作成
if [ ! -f .env ]; then
    echo "📝 .env ファイルを作成中..."
    cp .env.example .env
    echo "✅ .env ファイルを作成しました (.env.example をコピー)"
    echo
    
    # TMDb APIキーの設定を促す
    echo "⚠️  重要: TMDb APIキーの設定が必要です"
    echo "   1. https://www.themoviedb.org/settings/api にアクセス"
    echo "   2. APIキーを取得"
    echo "   3. .env ファイルの TMDB_API_KEY を設定"
    echo
    read -p "TMDb APIキーを取得しましたか？ (y/N): " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "💡 TMDb APIキーを取得してから再度実行してください"
        echo "   APIキー取得後: ./setup.sh"
        exit 0
    fi
    
    # APIキーの入力
    echo
    read -p "🔑 TMDb APIキーを入力してください: " tmdb_key
    if [ ! -z "$tmdb_key" ]; then
        # macOS/Linux 互換性を考慮
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/your_tmdb_api_key_here/$tmdb_key/" .env
        else
            sed -i "s/your_tmdb_api_key_here/$tmdb_key/" .env
        fi
        echo "✅ TMDb APIキーを設定しました"
    fi
else
    echo "✅ .env ファイルが既に存在します"
fi
echo

# 3. Docker環境の起動
echo "🐳 Docker環境を起動中..."
docker-compose down 2>/dev/null || true  # 既存のコンテナを停止
docker-compose up -d db
echo "✅ PostgreSQLデータベースを起動しました"
echo

# 4. データベースの初期化待機
echo "⏳ データベース初期化を待機中..."
sleep 10

# 5. バックエンドの起動
echo "🚀 バックエンドサービスを起動中..."
docker-compose up -d backend
echo "✅ Spring Boot バックエンドを起動しました"
echo

# 6. フロントエンドの依存関係インストール
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 フロントエンド依存関係をインストール中..."
    cd frontend
    npm install
    cd ..
    echo "✅ フロントエンド依存関係をインストールしました"
else
    echo "✅ フロントエンド依存関係は既にインストール済みです"
fi
echo

# 7. フロントエンドの起動
echo "🌐 フロントエンドサービスを起動中..."
docker-compose up -d frontend
echo "✅ React フロントエンドを起動しました"
echo

# 8. 起動確認
echo "🔍 サービス起動状況を確認中..."
sleep 5

# サービスの状態確認
if curl -s http://localhost:8080/api/movies/trending >/dev/null 2>&1; then
    echo "✅ バックエンドAPI (Port 8080) が正常に起動しました"
else
    echo "⚠️  バックエンドAPI (Port 8080) の起動を確認中です..."
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ フロントエンド (Port 3000) が正常に起動しました"
else
    echo "⚠️  フロントエンド (Port 3000) の起動を確認中です..."
fi
echo

# 9. 完了メッセージ
echo "🎉 セットアップが完了しました！"
echo
echo "📱 アクセス情報:"
echo "   フロントエンド: http://localhost:3000"
echo "   バックエンドAPI: http://localhost:8080/api"
echo "   データベース: localhost:5432"
echo
echo "🔧 便利なコマンド:"
echo "   ログ確認: docker-compose logs -f"
echo "   サービス停止: docker-compose down"
echo "   開発モード: ./start-dev.sh"
echo
echo "📚 テストユーザー:"
echo "   Email: tatsukonkon@gmail.com"
echo "   Password: lp09okmn"
echo

# 10. ブラウザで開く（オプション）
read -p "🌐 ブラウザでアプリケーションを開きますか？ (y/N): " open_browser
if [[ "$open_browser" =~ ^[Yy]$ ]]; then
    if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
    else
        echo "   手動で http://localhost:3000 にアクセスしてください"
    fi
fi

echo "🎬 CineTrack のセットアップが完了しました！映画を楽しんでください！"