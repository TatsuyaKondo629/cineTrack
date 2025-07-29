# 🚀 cineTrack デプロイメントガイド

Vercel (フロントエンド) + Railway (バックエンド) による無料デプロイメント

## 📋 前提条件

- GitHubアカウント
- TMDb APIキー ([取得方法](https://www.themoviedb.org/settings/api))
- Vercelアカウント (GitHub連携)
- Railwayアカウント (GitHub連携)

## 🎯 デプロイメント概要

| コンポーネント | サービス | URL例 | 費用 |
|---------------|---------|-------|------|
| フロントエンド | Vercel | https://cinetrack.vercel.app | 無料 |
| バックエンド | Railway | https://cinetrack-api.railway.app | 無料 (月500時間) |
| データベース | Railway PostgreSQL | 内蔵 | 無料 (1GB) |

---

## 🚀 自動デプロイ手順

### Step 1: 自動準備スクリプト実行

```bash
./deploy.sh
```

このスクリプトが自動実行する内容:
- ✅ テスト実行 (フロントエンド・バックエンド)
- ✅ 本番ビルドテスト
- ✅ GitHubへのプッシュ
- ✅ デプロイメント設定ファイルの作成

---

## 🌐 フロントエンド デプロイ (Vercel)

### 1. Vercelアカウント作成・ログイン
- [Vercel](https://vercel.com) にアクセス
- "Sign up with GitHub" でアカウント作成

### 2. プロジェクトインポート
1. Vercel ダッシュボードで "New Project" をクリック
2. GitHubリポジトリ `cineTrack` を選択
3. **Root Directory**: `frontend` を指定
4. **Framework Preset**: "Create React App" を選択
5. **Build Command**: `npm run build` (自動設定)
6. **Output Directory**: `build` (自動設定)

### 3. 環境変数設定
Settings → Environment Variables で追加:

```env
REACT_APP_API_BASE_URL=https://your-backend-url.railway.app/api
```

### 4. デプロイ実行
- "Deploy" ボタンをクリック
- 2-3分で完了
- URLを取得: `https://your-app-name.vercel.app`

---

## 🚂 バックエンド デプロイ (Railway)

### 1. Railwayアカウント作成・ログイン
- [Railway](https://railway.app) にアクセス
- "Login with GitHub" でアカウント作成

### 2. プロジェクト作成
1. "New Project" → "Deploy from GitHub repo"
2. リポジトリ `cineTrack` を選択
3. **Root Directory**: `backend` を指定

### 3. PostgreSQL データベース追加
1. プロジェクト内で "New" → "Database" → "PostgreSQL"
2. データベースが自動作成される
3. 接続情報が自動で環境変数に設定される

### 4. 環境変数設定
Variables タブで以下を設定:

```env
# TMDb API
TMDB_API_KEY=your_actual_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# JWT設定
JWT_SECRET=your_production_jwt_secret_minimum_256_bits_change_this
JWT_EXPIRATION=86400

# CORS設定 (Vercelデプロイ後に更新)
CORS_ALLOWED_ORIGINS=https://your-frontend-app.vercel.app

# Database (Railway自動設定 - 変更不要)
# DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
```

### 5. デプロイ実行
- 自動デプロイが開始される
- 5-10分で完了
- URLを取得: `https://your-backend-name.railway.app`

---

## 🔧 デプロイ後の設定更新

### 1. フロントエンドのAPI URL更新
Vercel Settings → Environment Variables:
```env
REACT_APP_API_BASE_URL=https://your-actual-backend.railway.app/api
```

### 2. バックエンドのCORS設定更新
Railway Variables:
```env
CORS_ALLOWED_ORIGINS=https://your-actual-frontend.vercel.app
```

### 3. 再デプロイ
- Vercel: Deployments → "Redeploy"
- Railway: 自動で再デプロイされる

---

## ✅ 動作確認

### 1. フロントエンド確認
- https://your-app.vercel.app にアクセス
- ユーザー登録・ログインが動作すること
- 映画検索が動作すること

### 2. バックエンド確認
- https://your-backend.railway.app/api/health (ヘルスチェック)
- API エンドポイントが応答すること

### 3. 統合確認
- フロントエンドからバックエンドAPI呼び出しが成功すること
- データベース読み書きが正常に動作すること

---

## 🎯 カスタムドメイン設定 (オプション)

### Vercelでのカスタムドメイン
1. Settings → Domains
2. カスタムドメインを追加
3. DNS設定を更新

### Railwayでのカスタムドメイン
1. Settings → Domains
2. カスタムドメインを追加
3. DNS設定を更新

---

## 📊 モニタリング・ログ

### Vercel
- Analytics: アクセス解析
- Functions: パフォーマンス監視
- Logs: リアルタイムログ

### Railway
- Metrics: CPU・メモリ使用量
- Logs: アプリケーションログ
- Deployments: デプロイ履歴

---

## 🔒 セキュリティ設定

### 本番環境でのセキュリティ強化
1. **JWT秘密鍵**: 256bit以上のランダム文字列
2. **CORS設定**: 特定ドメインのみ許可
3. **環境変数**: 全ての秘密情報を環境変数化
4. **HTTPS**: 自動で有効化される

---

## 💡 トラブルシューティング

### よくある問題と解決方法

#### 1. CORS エラー
```
Access to XMLHttpRequest blocked by CORS policy
```
**解決方法**: Railway の `CORS_ALLOWED_ORIGINS` を正確なVercel URLに設定

#### 2. 環境変数が反映されない
**解決方法**: 
- Vercel: 環境変数設定後に再デプロイ
- Railway: 変数設定後は自動再デプロイ

#### 3. データベース接続エラー
**解決方法**: Railway PostgreSQLが起動していることを確認

#### 4. ビルドエラー
**解決方法**: ローカルで `./deploy.sh` を実行してエラーを確認

---

## 🔄 更新・メンテナンス

### アプリケーション更新手順
1. ローカルで変更・テスト
2. GitHubにプッシュ
3. Vercel・Railway が自動デプロイ

### データベースバックアップ
Railway ダッシュボードからデータベースエクスポート可能

### スケールアップが必要な場合
- Railway: 有料プランでリソース拡張
- Vercel: Pro プランで高速化・高可用性

---

## 📞 サポート

### 公式ドキュメント
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

### トラブル時の確認項目
1. デプロイログの確認
2. 環境変数の設定確認
3. ネットワーク・CORS設定の確認
4. データベース接続の確認

---

## 🎉 デプロイ完了！

おめでとうございます！cineTrackアプリケーションが世界中からアクセス可能になりました。

**次のステップ:**
- カスタムドメインの設定
- モニタリング・アラートの設定
- パフォーマンス最適化
- 機能拡張・改善

---

*このデプロイメントガイドで問題が発生した場合は、各セクションのトラブルシューティングを確認してください。*