# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cineTrackは映画鑑賞記録Webアプリケーションです。TMDb APIを使用してトレンド映画を表示し、ユーザーが映画の鑑賞記録を管理できます。

## Technology Stack

- **Backend**: Java (Spring Boot) + Spring Security + JWT認証
- **Frontend**: React
- **Database**: PostgreSQL  
- **API**: TMDb API
- **Container**: Docker & Docker Compose
- **Authentication**: JWT

## Project Structure

```
cineTrack/
├── backend/           # Spring Boot アプリケーション
├── frontend/          # React アプリケーション
├── docker-compose.yml # Docker設定
├── .env.example       # 環境変数テンプレート
└── .gitignore         # Git無視ファイル
```

## Development Commands

### 環境構築
```bash
# 環境変数ファイルをコピーして設定
cp .env.example .env

# Docker環境起動
docker-compose up -d

# 全サービス停止
docker-compose down
```

### 開発サーバー
```bash
# 全サービス起動（開発モード）
docker-compose up

# 個別サービス起動
docker-compose up db          # データベースのみ
docker-compose up backend     # バックエンドのみ  
docker-compose up frontend    # フロントエンドのみ
```

### データベース
```bash
# PostgreSQL接続
docker exec -it cinetrack_db psql -U cinetrack_user -d cinetrack

# データベースリセット
docker-compose down -v
docker-compose up db
```

## Architecture Notes

### Backend (Spring Boot)
- **Port**: 8080
- **Base URL**: http://localhost:8080/api
- **Authentication**: JWT with Spring Security
- **Database**: PostgreSQL with JPA/Hibernate

### Frontend (React)  
- **Port**: 3000
- **Base URL**: http://localhost:3000
- **API Communication**: Axios

### Database Schema
主要テーブル:
- users (ユーザー情報)
- movies (映画情報 - TMDb連携)
- viewing_records (鑑賞記録)

### Key Features
1. **認証機能**: ユーザー登録・ログイン (JWT)
2. **トレンド表示**: TMDb APIからトレンド映画取得
3. **鑑賞記録**: 映画の評価・鑑賞日・劇場・フォーマット記録
4. **CRUD操作**: 鑑賞記録の作成・編集・削除
5. **ソーシャル機能**: ユーザーフォロー、アクティビティフィード
6. **劇場検索**: 地域・チェーン別劇場検索機能
7. **ウィッシュリスト**: 映画の後で見たいリスト管理
8. **統計機能**: 視聴記録の詳細分析

## Test Coverage Status

### Frontend Test Coverage (最終更新: 2025-07-22)

**全体カバレッジ:**
- **Statements**: 92.18%
- **Branches**: 86.19%
- **Functions**: 84.53%
- **Lines**: 93.4%

**主要コンポーネントのカバレッジ:**
- **src/components**: Functions 81.25% (特にTheaterSearch.js)
  - ProtectedRoute.js: 100% ✓
  - Navbar.js: 100% ✓
  - TheaterSearch.js: 81.25% (未カバー行: 120,123,211-213,257,275,356,374)
- **Movies.js**: Functions 76% (目標80%に対して72%→76%に改善)
- **Dashboard.js**: 18/18テスト全て通過 ✓
- **Statistics.js**: テスト安定化済み

**テストファイル状況:**
- 新規作成: 9個のテストファイル
- 失敗テスト修正: Dashboard.test.js完了
- 安定化: Statistics.test.js, TheaterSearch.test.js

### テスト実行コマンド
```bash
# 全テスト実行
npm test

# カバレッジ付き実行
npm test -- --coverage --watchAll=false

# 特定ファイルのテスト
npm test -- --testPathPattern=Movies.test.js --watchAll=false

# 特定ディレクトリのカバレッジ
npm test -- --coverage --testPathPattern="src/components" --watchAll=false
```

## Environment Variables

`.env`ファイルに以下を設定:
- `TMDB_API_KEY`: TMDb APIキー
- `JWT_SECRET`: JWT秘密鍵  
- `POSTGRES_PASSWORD`: データベースパスワード

## API Integration

- **TMDb API**: https://api.themoviedb.org/3
- **Backend API**: RESTful API設計
- **Authentication**: JWT Bearer Token

## Known Issues & Technical Debt

### テスト関連
1. **MUI Grid v2 migration warnings**: 古いprops (item, xs, sm) の使用
2. **TheaterSearch.js未カバー行**: 複雑なMUI Selectイベントハンドラー
3. **失敗テストファイル**: Theaters.test.js, ProfileEdit.test.js, UserSearch.test.js, Statistics.test.js

### 開発優先度
- **High**: Movies.js functions カバレッジ 76% → 80%
- **Medium**: 失敗テストファイルの修正
- **Low**: MUI Grid v2 migration