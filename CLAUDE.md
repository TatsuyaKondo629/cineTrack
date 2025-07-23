# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cineTrackは映画鑑賞記録Webアプリケーションです。TMDb APIを使用してトレンド映画を表示し、ユーザーが映画の鑑賞記録を管理できます。

## Technology Stack

- **Backend**: Java 17 + Spring Boot 3.3.0 + Spring Security + JWT認証
- **Frontend**: React + Material-UI + React Router + Axios
- **Database**: PostgreSQL (production) + H2 (testing)
- **API**: TMDb API
- **Container**: Docker & Docker Compose
- **Authentication**: JWT Bearer Token
- **Testing**: Jest + React Testing Library (frontend), JUnit + Mockito (backend)
- **Build Tools**: Maven (backend), npm (frontend)

## Project Structure

```
cineTrack/
├── backend/                        # Spring Boot アプリケーション
│   ├── src/main/java/com/cinetrack/
│   │   ├── controller/             # REST API コントローラー
│   │   ├── service/               # ビジネスロジック
│   │   ├── entity/                # JPA エンティティ
│   │   ├── repository/            # データアクセス層
│   │   ├── dto/                   # データ転送オブジェクト
│   │   ├── security/              # JWT認証・認可
│   │   └── config/                # 設定クラス
│   ├── src/test/                  # バックエンドテスト
│   └── pom.xml                    # Maven設定
├── frontend/                      # React アプリケーション
│   ├── src/
│   │   ├── components/           # 再利用可能コンポーネント
│   │   ├── pages/               # ページコンポーネント
│   │   ├── context/             # React Context (認証等)
│   │   ├── services/            # API通信サービス
│   │   └── __tests__/           # テストファイル
│   └── package.json             # npm設定
├── docker-compose.yml           # Docker設定
├── .env.example                 # 環境変数テンプレート
├── setup.sh                    # 初回セットアップスクリプト
└── start-dev.sh                # 開発環境起動スクリプト
```

## Development Commands

### 初回セットアップ
```bash
# 自動セットアップスクリプト実行（推奨）
./setup.sh

# 手動セットアップ
cp .env.example .env
# .envファイルを編集してTMDb APIキーを設定
```

### 開発サーバー起動
```bash
# 統合開発環境起動（推奨）
./start-dev.sh

# Docker Compose での起動
docker-compose up                 # 全サービス起動
docker-compose up -d              # バックグラウンド起動
docker-compose up db backend      # 指定サービスのみ起動
```

### 個別サービス起動
```bash
# バックエンド（Spring Boot）
cd backend
mvn spring-boot:run

# フロントエンド（React）
cd frontend
npm start

# データベース（PostgreSQL）
docker-compose up -d db
```

### テスト実行
```bash
# フロントエンドテスト
cd frontend
npm test                    # インタラクティブモード
npm run test:coverage      # カバレッジ付き実行
npm run test:ci            # CI環境向け実行

# バックエンドテスト
cd backend
mvn test                   # 全テスト実行
mvn test -Dtest=ClassName  # 特定テストクラス実行
mvn jacoco:report          # カバレッジレポート生成
```

### ビルド・デプロイ
```bash
# フロントエンドビルド
cd frontend
npm run build

# バックエンドビルド
cd backend
mvn clean package

# Docker イメージビルド
docker-compose build
```

### データベース操作
```bash
# PostgreSQL接続
docker exec -it cinetrack_db psql -U cinetrack_user -d cinetrack

# データベースリセット
docker-compose down -v
docker-compose up -d db

# マイグレーション確認
# Hibernate auto-ddl でスキーマ自動更新
```

## Architecture Notes

### Backend (Spring Boot)
- **Port**: 8080
- **Base URL**: http://localhost:8080/api
- **Authentication**: JWT with Spring Security
- **Database**: PostgreSQL with JPA/Hibernate
- **API Documentation**: REST endpoints in controllers
- **Security**: CORS enabled, JWT token validation
- **Key Endpoints**:
  - `/auth/login` - ユーザーログイン
  - `/auth/register` - ユーザー登録
  - `/auth/me` - 現在のユーザー情報
  - `/movies/**` - 映画関連API
  - `/viewing-records/**` - 鑑賞記録API

### Frontend (React)
- **Port**: 3000
- **Base URL**: http://localhost:3000
- **API Communication**: Axios with interceptors
- **State Management**: React Context (AuthContext)
- **Routing**: React Router with protected routes
- **UI Framework**: Material-UI
- **Key Components**:
  - `AuthContext` - 認証状態管理 (context/AuthContext.js:5)
  - `ProtectedRoute` - 認証保護ルート
  - `Navbar` - ナビゲーション
  - Movie pages (Dashboard, Movies, Statistics)

### Database Schema
主要テーブル:
- `users` - ユーザー情報（username, email, password）
- `movies` - 映画情報（TMDb連携）
- `viewing_records` - 鑑賞記録（評価・鑑賞日・劇場）
- `theaters` - 劇場情報
- `user_follows` - フォロー関係
- `wishlists` - ウィッシュリスト

### Key Features
1. **認証機能**: JWT認証、ユーザー登録・ログイン (AuthController.java:34)
2. **映画検索**: TMDb API連携、トレンド映画表示
3. **鑑賞記録管理**: CRUD操作、評価・劇場情報記録
4. **ソーシャル機能**: ユーザーフォロー、アクティビティフィード
5. **統計機能**: 鑑賞履歴分析、グラフ表示
6. **劇場検索**: 地域別劇場検索機能
7. **ウィッシュリスト**: 観たい映画管理

## Environment Variables

必須の環境変数（`.env`ファイルに設定）:
```bash
# TMDb API設定 (application.yml:42)
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# JWT設定 (application.yml:37)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# データベース設定 (application.yml:5)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cinetrack
SPRING_DATASOURCE_USERNAME=cinetrack_user
SPRING_DATASOURCE_PASSWORD=cinetrack123

# CORS設定 (application.yml:47)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# React環境変数 (AuthContext.js:19)
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

## Testing Guidelines

### フロントエンド
- **フレームワーク**: Jest + React Testing Library
- **カバレッジ目標**: 90%+ statements, 80%+ branches
- **テスト方針**: 統合テスト重視、ユーザー行動のテスト
- **モック**: API レスポンス、外部ライブラリ
- **現在のカバレッジ**: 90%+ statements, 82%+ branches (安定状態)

### バックエンド
- **フレームワーク**: JUnit 5 + Mockito 5.14.0 (pom.xml:120)
- **カバレッジ目標**: 95%+ instructions, 90%+ branches
- **テスト方針**: 単体テスト + 統合テスト
- **データベース**: H2 in-memory database for testing (pom.xml:52)

## API Integration

### TMDb API
- **Base URL**: https://api.themoviedb.org/3
- **Key Endpoints**: 
  - `/trending/movie/day` - 日次トレンド
  - `/search/movie` - 映画検索
  - `/movie/{id}` - 映画詳細
- **Authentication**: API Key in query parameter

### Internal APIs
- **Base URL**: http://localhost:8080/api (application.yml:34)
- **Authentication**: JWT Bearer Token (AuthController.java:46)
- **Response Format**: 標準化されたAPIレスポンス（ApiResponse<T>）

## Common Issues & Solutions

### Development
- **CORS エラー**: backend の CORS 設定確認 (application.yml:47)
- **JWT トークンエラー**: localStorage の token 確認 (AuthContext.js:16)
- **TMDb API エラー**: API キーの有効性確認
- **データベース接続エラー**: PostgreSQL コンテナの起動確認

### Testing
- **Material-UI テストエラー**: モックの適切な設定
- **非同期テストエラー**: waitFor, act の適切な使用
- **カバレッジ低下**: 不要なファイルの除外設定

### Deployment
- **環境変数設定**: 本番環境での適切な設定
- **HTTPS対応**: 本番環境でのTLS設定

## Development Tools & Scripts

### Setup Scripts
- **setup.sh**: 初回開発環境セットアップ（TMDb API キー設定含む）
- **start-dev.sh**: 統合開発環境起動スクリプト

### Key Dependencies
- **Backend**: Spring Boot 3.3.0, Java 17, PostgreSQL, JWT (pom.xml)
- **Frontend**: React, Material-UI, React Router, Axios (package.json)

### Code Quality
- **Backend**: JaCoCo test coverage plugin (pom.xml:199)
- **Frontend**: Jest coverage reports
- **Linting**: Configuration in package.json scripts