# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

cineTrackは映画鑑賞記録Webアプリケーションです。TMDb APIを使用してトレンド映画を表示し、ユーザーが映画の鑑賞記録を管理できます。

## 技術スタック

- **Backend**: Java 17 + Spring Boot 3.3.0 + Spring Security + JWT認証
- **Frontend**: React + Material-UI + React Router + Axios
- **Database**: PostgreSQL (production) + H2 (testing)
- **API**: TMDb API
- **Container**: Docker & Docker Compose
- **Authentication**: JWT Bearer Token
- **Testing**: Jest + React Testing Library (frontend), JUnit + Mockito (backend)
- **Build Tools**: Maven (backend), npm (frontend)

## プロジェクト構成

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

## 開発コマンド

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
npm test                          # インタラクティブモード
npm test -- --coverage --watchAll=false  # カバレッジ付きワンショット実行
npm test -- --testNamePattern="specific test"  # 特定テスト実行
npm test ComponentName.test.js   # 特定ファイルのテスト実行

# バックエンドテスト  
cd backend
mvn test                         # 全テスト実行
mvn test -Dtest=ClassName        # 特定テストクラス実行
mvn test -Dtest=ClassName#methodName  # 特定テストメソッド実行
mvn jacoco:report                # カバレッジレポート生成 (target/site/jacoco/)
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

## アーキテクチャ概要

### バックエンド (Spring Boot)
- **ポート**: 8080
- **ベースURL**: http://localhost:8080/api
- **認証**: JwtAuthenticationFilterを使用したJWT + Spring Security認証
- **データベース**: PostgreSQL + JPA/Hibernate
- **セキュリティ**: CORS有効、JWT トークン検証、Authorization ヘッダーでBearer トークン
- **APIレスポンス形式**: success/message/dataフィールドを持つ標準化されたApiResponse<T>ラッパー
- **コントローラー**: 8つのメインコントローラー (Auth, Movie, ViewingRecord, Social, User, Wishlist, Stats, Theater)
- **主要アーキテクチャパターン**: レイヤード構成 (Controller → Service → Repository → Entity)
- **外部API連携**: WebFluxを使用したリアクティブなTMDb API統合

### フロントエンド (React)
- **ポート**: 3000
- **ベースURL**: http://localhost:3000
- **API通信**: Bearer トークン認証を使用したAxios
- **状態管理**: 認証用のReact Context (AuthContext)
- **ルーティング**: ProtectedRoute ラッパーを使用したReact Router v7.6.3
- **UIフレームワーク**: Netflixインスパイアドダークテーマを適用したMaterial-UI v7.2.0
- **主要アーキテクチャ**:
  - `AuthContext` - グローバル認証状態 (localStorage トークン管理)
  - `ProtectedRoute` - 認証ページ用のルートガード
  - `pages/` - メインアプリケーションページ (合計14ページ)
  - `components/` - パフォーマンス最適化された再利用可能UIコンポーネント
  - `hooks/` - 標準化されたAPI操作用のuseApiCallなどのカスタムフック

### データベーススキーマ
Hibernate auto-DDLスキーマ生成を使用したJPAエンティティ:
- `users` - ユーザー認証とプロフィール (UserDetails実装)
- `viewing_records` - 評価、レビュー、劇場情報を含む映画鑑賞履歴
- `theaters` - 位置検索機能付きの映画館/劇場マスターデータ
- `follows` - ユーザー間のソーシャルフォロー関係
- `wishlists` - TMDb映画参照を含むユーザーの映画ウィッシュリスト

主要な関係性: User 1:N ViewingRecord, User 1:N Wishlist, Theater 1:N ViewingRecord

### 主要機能
1. **認証機能**: JWT認証、ユーザー登録・ログイン (AuthController.java:34)
2. **映画検索**: TMDb API連携、トレンド映画表示
3. **鑑賞記録管理**: CRUD操作、評価・劇場情報記録
4. **ソーシャル機能**: ユーザーフォロー、アクティビティフィード
5. **統計機能**: 鑑賞履歴分析、グラフ表示
6. **劇場検索**: 地域別劇場検索機能
7. **ウィッシュリスト**: 観たい映画管理

## 環境変数

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

## テストガイドライン

### フロントエンド
- **フレームワーク**: Jest + React Testing Library + @testing-library/user-event
- **カバレッジ目標**: 90%+ statements, 80%+ branches (現在達成済み)
- **テスト方針**: ユーザー中心の統合テスト、実装詳細の回避
- **モック戦略**: `__mocks__/axios.js`でAPIレスポンスをモック、`__mocks__/react-router-dom.js`でReact Routerをモック
- **テストユーティリティ**: AuthContextプロバイダー付きのカスタムレンダー関数
- **重要な注意**: Material-UIコンポーネントはwaitFor/actでの適切な非同期処理が必要

### バックエンド
- **フレームワーク**: JUnit 5 + Mockito + Spring Boot Test
- **カバレッジ目標**: 95%+ instructions, 90%+ branches (現在達成済み)
- **テスト戦略**: サービスの単体テスト、@WebMvcTestを使用したコントローラーの統合テスト
- **データベース**: テスト用H2インメモリ、TestContainersパターンは未使用
- **テスト設定**: 認証テスト用のカスタムTestUserDetailsとTestUserDetailsArgumentResolver

## API統合

### TMDb API
- **Base URL**: https://api.themoviedb.org/3
- **主要エンドポイント**: 
  - `/trending/movie/day` - 日次トレンド
  - `/search/movie` - 映画検索
  - `/movie/{id}` - 映画詳細
- **認証**: クエリパラメータでAPIキー

### 内部API
- **Base URL**: http://localhost:8080/api
- **認証**: Authorization ヘッダーでJWT Bearer Token
- **レスポンス形式**: success/message/dataフィールドを持つ標準化されたApiResponse<T>
- **エラーハンドリング**: 適切なHTTPステータスコードでのグローバル例外処理
- **API数**: 8つのコントローラーで51エンドポイント (docs/04_rest_api_specification.md参照)

## よくある問題と解決方法

### 開発時
- **CORS エラー**: backendのCORS設定確認 (application.yml:47)
- **JWT トークンエラー**: localStorageのtoken確認 (AuthContext.js:16)
- **TMDb API エラー**: APIキーの有効性確認
- **データベース接続エラー**: PostgreSQLコンテナの起動確認

### テスト時
- **Material-UI テストエラー**: モックの適切な設定
- **非同期テストエラー**: waitFor, actの適切な使用
- **カバレッジ低下**: 不要なファイルの除外設定

### デプロイ時
- **環境変数設定**: 本番環境での適切な設定
- **HTTPS対応**: 本番環境でのTLS設定

## 開発ツール・スクリプト

### セットアップスクリプト
- **setup.sh**: 初回開発環境セットアップ（TMDb APIキー設定含む）
- **start-dev.sh**: 統合開発環境起動スクリプト

### 主要依存関係
- **Backend**: Spring Boot 3.3.0, Java 17, PostgreSQL, JWT (pom.xml)
- **Frontend**: React, Material-UI, React Router, Axios (package.json)

### コード品質・ドキュメント
- **Backend**: JaCoCo テストカバレッジプラグインでtarget/site/jacoco/にレポート生成
- **Frontend**: coverage/ディレクトリにJestカバレッジレポート
- **設計ドキュメント**: docs/ディレクトリに包括的な設計書 (8つの仕様ファイル)
- **APIドキュメント**: 51エンドポイントを網羅した完全なREST API仕様書