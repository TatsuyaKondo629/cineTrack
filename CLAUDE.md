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

## Environment Variables

`.env`ファイルに以下を設定:
- `TMDB_API_KEY`: TMDb APIキー
- `JWT_SECRET`: JWT秘密鍵  
- `POSTGRES_PASSWORD`: データベースパスワード

## API Integration

- **TMDb API**: https://api.themoviedb.org/3
- **Backend API**: RESTful API設計
- **Authentication**: JWT Bearer Token