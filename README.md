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

## 開発環境セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 18+
- Java 17+
- Maven 3.6+

### 環境変数設定
1. `.env`ファイルを作成（既存のものを確認）:
```bash
# TMDb API設定（必須）
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# データベース設定
POSTGRES_DB=cinetrack
POSTGRES_USER=cinetrack_user
POSTGRES_PASSWORD=cinetrack123

# Spring Boot設定
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/cinetrack
SPRING_DATASOURCE_USERNAME=cinetrack_user
SPRING_DATASOURCE_PASSWORD=cinetrack123

# JWT設定
JWT_SECRET=mySecretKeyForCineTrackApplicationJWTSecurity123456789ABCDEFGHabcdefgh
JWT_EXPIRATION=86400

# React環境変数
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### 開発環境起動

#### 方法1: 開発用スクリプト（推奨）
```bash
./start-dev.sh
```

#### 方法2: Docker Compose（本番環境想定）
```bash
docker compose up -d
```

#### 方法3: 手動起動
```bash
# 1. PostgreSQL起動
docker compose up -d db

# 2. バックエンド起動
cd backend
TMDB_API_KEY=your_key TMDB_BASE_URL=https://api.themoviedb.org/3 mvn spring-boot:run

# 3. フロントエンド起動
cd frontend
npm start
```

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