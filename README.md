# CineTrack - 映画トラッキングアプリ

映画の視聴記録、レビュー、評価を管理するWebアプリケーションです。

## 機能
- 映画の検索・閲覧（TMDb API連携）
- 視聴記録の登録・管理
- 映画のレビュー・評価
- ユーザー管理・認証
- レスポンシブデザイン

## 技術スタック
- **Frontend**: React 18, Material-UI, Axios
- **Backend**: Spring Boot 3.3, Spring Security, JWT
- **Database**: PostgreSQL
- **API**: TMDb API（映画データ）
- **Containerization**: Docker, Docker Compose

## 🚀 クイックスタート

### 新しい開発者向け（推奨）
```bash
# 1. リポジトリをクローン
git clone https://github.com/YourUsername/cineTrack.git
cd cineTrack

# 2. 自動セットアップを実行
./setup.sh
```
**これだけで完了！** 🎉 自動的にすべてが設定されます。

### 必要な外部サービス
- **TMDb API** (必須): [こちら](https://www.themoviedb.org/settings/api)でAPIキーを取得

---

## 📋 開発環境セットアップ（詳細）

### 前提条件
- Docker & Docker Compose
- TMDb APIキー（映画データ取得用）

### 手動セットアップ
```bash
# 1. 環境変数ファイルを作成
cp .env.example .env

# 2. .envファイルでTMDb APIキーを設定
# TMDB_API_KEY=your_actual_api_key_here

# 3. Docker環境起動
docker compose up -d

# または開発モード
./start-dev.sh
```

### 環境変数設定
`.env`ファイルの主要設定項目：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `TMDB_API_KEY` | TMDb API キー | ✅ |
| `POSTGRES_PASSWORD` | DB パスワード | デフォルト値あり |
| `JWT_SECRET` | JWT 秘密鍵 | デフォルト値あり |

詳細は `.env.example` を参照してください。

## アクセス
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432

## テストユーザー
- **Email**: tatsukonkon@gmail.com
- **Password**: lp09okmn

## API エンドポイント
- `GET /api/movies/trending` - トレンド映画
- `GET /api/movies/popular` - 人気映画
- `GET /api/movies/search` - 映画検索
- `GET /api/viewing-records` - 視聴記録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/register` - 登録

## 開発Tips
- `.env`ファイルの環境変数は自動で読み込まれます
- バックエンドはSpring Boot DevToolsで自動リロード
- フロントエンドはReact Hot Reloadで自動更新
- データベースはDockerで管理されるため、データは永続化されます

## トラブルシューティング
- TMDb APIキーが正しく設定されているか確認
- PostgreSQLコンテナが起動しているか確認
- ポート3000, 8080, 5432が使用可能か確認