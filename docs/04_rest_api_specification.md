# REST API仕様書

## 1. API概要

### 1.1 基本情報

| 項目 | 値 |
|------|---|
| Base URL | http://localhost:8080/api |
| 認証方式 | JWT Bearer Token |
| コンテンツタイプ | application/json |
| 文字エンコーディング | UTF-8 |
| APIバージョン | v1 |

### 1.2 共通レスポンス形式

全てのAPIエンドポイントは以下の統一形式でレスポンスを返します：

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array | null
}
```

### 1.3 認証ヘッダー

認証が必要なエンドポイントでは、以下のヘッダーを含める必要があります：

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## 2. 認証API

### 2.1 ユーザーログイン

```http
POST /auth/login
```

**説明**: ユーザー認証とJWTトークン取得

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "string (必須, メール形式)",
  "password": "string (必須)"
}
```

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

❌ **401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

参照: `AuthController.java:34-59`

### 2.2 ユーザー登録

```http
POST /auth/register
```

**説明**: 新規ユーザーアカウント作成

**認証**: 不要

**リクエストボディ**:
```json
{
  "username": "string (必須, 3-50文字, 英数字)",
  "email": "string (必須, メール形式)",
  "password": "string (必須, 最低6文字)"
}
```

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

❌ **400 Bad Request**
```json
{
  "success": false,
  "message": "Username already exists",
  "data": null
}
```

参照: `AuthController.java:61-89`

### 2.3 現在のユーザー情報取得

```http
GET /auth/me
```

**説明**: JWTトークンから現在ログイン中のユーザー情報を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "displayName": "ユーザー太郎",
    "bio": "映画好きです",
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

参照: `AuthController.java:91-114`

## 3. 映画情報API

### 3.1 トレンド映画取得

```http
GET /movies/trending?page={page}
```

**説明**: TMDb APIからトレンド映画一覧を取得

**認証**: 不要

**クエリパラメータ**:
- `page` (任意): ページ番号 (デフォルト: 1)

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Trending movies retrieved successfully",
  "data": {
    "page": 1,
    "results": [
      {
        "id": 12345,
        "title": "アベンジャーズ",
        "originalTitle": "Avengers",
        "overview": "地球最強のヒーローチームが...",
        "releaseDate": "2024-05-01",
        "posterPath": "/poster.jpg",
        "backdropPath": "/backdrop.jpg",
        "voteAverage": 8.5,
        "voteCount": 15000,
        "adult": false,
        "genreIds": [28, 12, 878],
        "popularity": 1250.5,
        "originalLanguage": "en"
      }
    ],
    "totalPages": 500,
    "totalResults": 10000
  }
}
```

参照: `MovieController.java:20-31`

### 3.2 人気映画取得

```http
GET /movies/popular?page={page}
```

**説明**: TMDb APIから人気映画一覧を取得

**認証**: 不要

**クエリパラメータ**:
- `page` (任意): ページ番号 (デフォルト: 1)

**レスポンス例**: トレンド映画と同じ形式

参照: `MovieController.java:33-43`

### 3.3 現在上映中映画取得

```http
GET /movies/now-playing?page={page}
```

**説明**: TMDb APIから現在上映中の映画一覧を取得

**認証**: 不要

**クエリパラメータ**:
- `page` (任意): ページ番号 (デフォルト: 1)

**レスポンス例**: トレンド映画と同じ形式

参照: `MovieController.java:45-55`

### 3.4 映画検索

```http
GET /movies/search?query={query}&page={page}
```

**説明**: 映画タイトルでの検索

**認証**: 不要

**クエリパラメータ**:
- `query` (必須): 検索キーワード
- `page` (任意): ページ番号 (デフォルト: 1)

**レスポンス例**: トレンド映画と同じ形式

参照: `MovieController.java:57-73`

### 3.5 映画詳細取得

```http
GET /movies/{movieId}
```

**説明**: 指定された映画IDの詳細情報を取得

**認証**: 不要

**パスパラメータ**:
- `movieId`: TMDb映画ID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Movie details retrieved successfully",
  "data": {
    "id": 12345,
    "title": "アベンジャーズ",
    "runtime": 143,
    "genres": [
      {"id": 28, "name": "アクション"},
      {"id": 12, "name": "アドベンチャー"}
    ],
    "productionCompanies": [
      {"id": 420, "name": "Marvel Studios"}
    ]
  }
}
```

参照: `MovieController.java:75-85`

## 4. 鑑賞記録API

### 4.1 鑑賞記録作成

```http
POST /viewing-records
```

**説明**: 新しい映画鑑賞記録を作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "tmdbMovieId": 12345,
  "movieTitle": "string (必須, 最大255文字)",
  "moviePosterPath": "string (任意)",
  "viewingDate": "2024-01-15T19:30:00 (必須, ISO 8601形式)",
  "rating": 4.5,
  "theater": "string (任意, 最大255文字)",
  "theaterId": 1,
  "screeningFormat": "string (任意, 最大50文字)",
  "review": "string (任意, 最大2000文字)"
}
```

**バリデーション**:
- `rating`: 0.5〜5.0の範囲、0.5刻み
- `viewingDate`: 未来日時不可
- `movieTitle`: 空文字不可

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Viewing record created successfully",
  "data": {
    "id": 1,
    "tmdbMovieId": 12345,
    "movieTitle": "アベンジャーズ",
    "moviePosterPath": "/poster.jpg",
    "viewingDate": "2024-01-15T19:30:00",
    "rating": 4.5,
    "theater": "TOHOシネマズ渋谷",
    "theaterId": 1,
    "theaterInfo": {
      "id": 1,
      "name": "TOHOシネマズ渋谷",
      "prefecture": "東京都",
      "city": "渋谷区"
    },
    "screeningFormat": "IMAX",
    "review": "素晴らしい映画でした！",
    "createdAt": "2024-01-15T20:00:00",
    "updatedAt": "2024-01-15T20:00:00"
  }
}
```

参照: `ViewingRecordController.java:30-41`

### 4.2 鑑賞記録一覧取得（ページネーション）

```http
GET /viewing-records?page={page}&size={size}
```

**説明**: ユーザーの鑑賞記録をページネーションで取得

**認証**: 必要

**クエリパラメータ**:
- `page` (任意): ページ番号 (デフォルト: 0)
- `size` (任意): ページサイズ (デフォルト: 10)

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Viewing records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "tmdbMovieId": 12345,
        "movieTitle": "アベンジャーズ",
        "rating": 4.5,
        "viewingDate": "2024-01-15T19:30:00"
      }
    ],
    "pageable": {
      "sort": {"sorted": false, "unsorted": true},
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 25,
    "totalPages": 3,
    "first": true,
    "last": false,
    "numberOfElements": 10
  }
}
```

参照: `ViewingRecordController.java:57-70`

### 4.3 鑑賞記録更新

```http
PUT /viewing-records/{recordId}
```

**説明**: 既存の鑑賞記録を更新

**認証**: 必要

**パスパラメータ**:
- `recordId`: 鑑賞記録ID

**リクエストボディ**: 作成時と同じ形式

**レスポンス例**: 作成時と同じ形式

参照: `ViewingRecordController.java:101-113`

### 4.4 鑑賞記録削除

```http
DELETE /viewing-records/{recordId}
```

**説明**: 指定された鑑賞記録を削除

**認証**: 必要

**パスパラメータ**:
- `recordId`: 鑑賞記録ID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Viewing record deleted successfully",
  "data": null
}
```

❌ **404 Not Found**
```json
{
  "success": false,
  "message": "Viewing record not found",
  "data": null
}
```

参照: `ViewingRecordController.java:115-126`

### 4.5 鑑賞記録検索・フィルタリング

#### 映画タイトル検索

```http
GET /viewing-records/search?movieTitle={title}&page={page}&size={size}
```

**クエリパラメータ**:
- `movieTitle` (必須): 映画タイトル（部分一致）

参照: `ViewingRecordController.java:128-143`

#### 評価による絞り込み

```http
GET /viewing-records/by-rating?minRating={rating}&page={page}&size={size}
```

**クエリパラメータ**:
- `minRating` (必須): 最低評価 (0.5-5.0)

参照: `ViewingRecordController.java:145-160`

#### 日付範囲による絞り込み

```http
GET /viewing-records/by-date-range?startDate={start}&endDate={end}
```

**クエリパラメータ**:
- `startDate` (必須): 開始日時 (ISO 8601形式)
- `endDate` (必須): 終了日時 (ISO 8601形式)

参照: `ViewingRecordController.java:162-182`

### 4.6 視聴済みチェック

```http
GET /viewing-records/check-watched/{tmdbMovieId}
```

**説明**: 指定された映画を視聴済みかチェック

**認証**: 必要

**パスパラメータ**:
- `tmdbMovieId`: TMDb映画ID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Watched status retrieved successfully",
  "data": {
    "watched": true,
    "recordCount": 2
  }
}
```

参照: `ViewingRecordController.java:202-218`

## 5. ソーシャル機能API

### 5.1 ユーザー検索

```http
GET /social/users/search?query={query}&page={page}&size={size}
```

**説明**: ユーザー名での部分一致検索

**認証**: 必要

**クエリパラメータ**:
- `query` (任意): 検索キーワード
- `page` (任意): ページ番号 (デフォルト: 0)
- `size` (任意): ページサイズ (デフォルト: 10)

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "content": [
      {
        "id": 2,
        "username": "moviefan",
        "displayName": "映画ファン",
        "bio": "映画レビューを書いています",
        "avatarUrl": null,
        "followerCount": 50,
        "followingCount": 30,
        "isFollowing": false,
        "isFollowedBy": false,
        "isMutualFollow": false,
        "totalMovieCount": 120,
        "averageRating": 4.2
      }
    ],
    "totalElements": 5,
    "totalPages": 1
  }
}
```

参照: `SocialController.java:31-45`

### 5.2 ユーザーフォロー

```http
POST /social/users/{userId}/follow
```

**説明**: 指定されたユーザーをフォロー

**認証**: 必要

**パスパラメータ**:
- `userId`: フォロー対象のユーザーID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "User followed successfully",
  "data": {
    "isFollowing": true,
    "followerCount": 51
  }
}
```

❌ **400 Bad Request**
```json
{
  "success": false,
  "message": "Cannot follow yourself",
  "data": null
}
```

参照: `SocialController.java:70-85`

### 5.3 フォロー解除

```http
DELETE /social/users/{userId}/follow
```

**説明**: 指定されたユーザーのフォローを解除

**認証**: 必要

**パスパラメータ**:
- `userId`: フォロー解除対象のユーザーID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "User unfollowed successfully",
  "data": {
    "isFollowing": false,
    "followerCount": 49
  }
}
```

参照: `SocialController.java:90-105`

### 5.4 アクティビティフィード

```http
GET /social/activities?page={page}&size={size}
```

**説明**: フォローしているユーザーのアクティビティを取得

**認証**: 必要

**クエリパラメータ**:
- `page` (任意): ページ番号 (デフォルト: 0)
- `size` (任意): ページサイズ (デフォルト: 20)

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Activity feed retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "user": {
          "username": "moviefan",
          "displayName": "映画ファン"
        },
        "tmdbMovieId": 12345,
        "movieTitle": "アベンジャーズ",
        "moviePosterPath": "/poster.jpg",
        "rating": 4.5,
        "viewingDate": "2024-01-15T19:30:00",
        "review": "素晴らしい映画でした！",
        "createdAt": "2024-01-15T20:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 5
  }
}
```

参照: `SocialController.java:177-190`

## 6. ウィッシュリストAPI

### 6.1 ウィッシュリスト取得

```http
GET /wishlist
```

**説明**: ユーザーのウィッシュリストを取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": [
    {
      "id": 1,
      "tmdbMovieId": 67890,
      "movieTitle": "スパイダーマン",
      "moviePosterPath": "/spiderman.jpg",
      "movieOverview": "ピーター・パーカーが...",
      "movieReleaseDate": "2024-06-01",
      "movieVoteAverage": 8.2,
      "createdAt": "2024-01-10T15:30:00"
    }
  ]
}
```

参照: `WishlistController.java:30-42`

### 6.2 ウィッシュリストに追加

```http
POST /wishlist/add
```

**説明**: 映画をウィッシュリストに追加

**認証**: 必要

**リクエストボディ**:
```json
{
  "tmdbMovieId": 67890,
  "movieTitle": "string (必須, 最大255文字)",
  "moviePosterPath": "string (任意)",
  "movieOverview": "string (任意)",
  "movieReleaseDate": "string (任意)",
  "movieVoteAverage": 8.2
}
```

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Movie added to wishlist successfully",
  "data": {
    "id": 2,
    "tmdbMovieId": 67890,
    "movieTitle": "スパイダーマン",
    "moviePosterPath": "/spiderman.jpg",
    "movieOverview": "ピーター・パーカーが...",
    "movieReleaseDate": "2024-06-01",
    "movieVoteAverage": 8.2,
    "createdAt": "2024-01-16T10:00:00"
  }
}
```

❌ **400 Bad Request**
```json
{
  "success": false,
  "message": "Movie already in wishlist",
  "data": null
}
```

参照: `WishlistController.java:47-76`

### 6.3 ウィッシュリストから削除

```http
DELETE /wishlist/remove/{tmdbMovieId}
```

**説明**: 指定された映画をウィッシュリストから削除

**認証**: 必要

**パスパラメータ**:
- `tmdbMovieId`: TMDb映画ID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Movie removed from wishlist successfully",
  "data": null
}
```

参照: `WishlistController.java:81-98`

### 6.4 ウィッシュリスト存在チェック

```http
GET /wishlist/check/{tmdbMovieId}
```

**説明**: 指定された映画がウィッシュリストに存在するかチェック

**認証**: 必要

**パスパラメータ**:
- `tmdbMovieId`: TMDb映画ID

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Wishlist check completed",
  "data": {
    "inWishlist": true
  }
}
```

### 6.5 ウィッシュリスト件数取得

```http
GET /wishlist/count
```

**説明**: ユーザーのウィッシュリスト件数を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Wishlist count retrieved",
  "data": {
    "count": 15
  }
}
```

### 6.6 ウィッシュリスト全削除

```http
DELETE /wishlist/clear
```

**説明**: ユーザーのウィッシュリストを全削除

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "data": null
}
```

## 7. ユーザー管理API

### 7.1 現在ユーザープロフィール取得

```http
GET /users/profile
```

**説明**: 現在ログイン中のユーザーのプロフィール情報を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "プロフィールを取得しました",
  "data": {
    "id": 1,
    "username": "user123",
    "displayName": "ユーザー太郎",
    "bio": "映画好きです",
    "avatarUrl": null,
    "followerCount": 10,
    "followingCount": 5,
    "totalMovieCount": 25,
    "averageRating": 4.2
  }
}
```

参照: `UserController.java:30-45`

### 7.2 ユーザープロフィール更新

```http
PUT /users/profile
```

**説明**: 現在ユーザーのプロフィール情報を更新

**認証**: 必要

**リクエストボディ**:
```json
{
  "displayName": "string (任意, 最大100文字)",
  "bio": "string (任意, 最大500文字)",
  "avatarUrl": "string (任意)"
}
```

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "プロフィールを更新しました",
  "data": {
    "id": 1,
    "username": "user123",
    "displayName": "更新された表示名",
    "bio": "更新された自己紹介",
    "avatarUrl": "http://example.com/avatar.jpg"
  }
}
```

参照: `UserController.java:50-65`

## 8. 統計情報API

### 8.1 月別統計

```http
GET /stats/monthly
```

**説明**: ユーザーの月別鑑賞統計を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "月別統計を取得しました",
  "data": [
    {
      "month": 1,
      "movieCount": 5,
      "averageRating": 4.2,
      "totalHours": 12.5
    },
    {
      "month": 2,
      "movieCount": 3,
      "averageRating": 4.5,
      "totalHours": 7.2
    }
  ]
}
```

参照: `StatsController.java:28-41`

### 8.2 ジャンル統計

```http
GET /stats/genres
```

**説明**: ユーザーのジャンル別鑑賞統計を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "ジャンル統計を取得しました",
  "data": [
    {
      "genre": "アクション",
      "movieCount": 25,
      "averageRating": 4.1
    },
    {
      "genre": "ドラマ",
      "movieCount": 18,
      "averageRating": 4.3
    }
  ]
}
```

参照: `StatsController.java:43-56`

### 8.3 評価分布統計

```http
GET /stats/ratings
```

**説明**: ユーザーの評価分布統計を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "評価分布を取得しました",
  "data": [
    {
      "rating": 5.0,
      "count": 15
    },
    {
      "rating": 4.5,
      "count": 22
    },
    {
      "rating": 4.0,
      "count": 18
    }
  ]
}
```

参照: `StatsController.java:58-71`

### 8.4 全体統計

```http
GET /stats/overall
```

**説明**: ユーザーの総合統計情報を取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "全体統計を取得しました",
  "data": {
    "totalMovies": 150,
    "averageRating": 4.3,
    "totalHours": 300.5,
    "favoriteGenre": "アクション",
    "mostActiveMonth": "12月",
    "bestRatedMovie": "インセプション",
    "mostWatchedYear": 2023
  }
}
```

参照: `StatsController.java:73-86`

### 8.5 統計サマリー

```http
GET /stats/summary
```

**説明**: 全ての統計情報を一括取得

**認証**: 必要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "統計サマリーを取得しました",
  "data": {
    "overall": { /* 全体統計データ */ },
    "monthly": [ /* 月別統計データ */ ],
    "genres": [ /* ジャンル統計データ */ ],
    "ratings": [ /* 評価分布データ */ ]
  }
}
```

参照: `StatsController.java:88-105`

## 9. 劇場情報API

### 9.1 劇場検索

```http
GET /theaters/search?query={query}&prefecture={prefecture}&city={city}&chain={chain}&page={page}&size={size}
```

**説明**: 複数条件での劇場検索

**認証**: 不要

**クエリパラメータ**:
- `query` (任意): 劇場名・チェーン・場所での検索
- `prefecture` (任意): 都道府県
- `city` (任意): 市区町村
- `chain` (任意): チェーン名
- `latitude` (任意): 緯度（近隣検索用）
- `longitude` (任意): 経度（近隣検索用）
- `radius` (任意): 検索半径（km、デフォルト: 10）
- `page` (任意): ページ番号
- `size` (任意): ページサイズ

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Theaters retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "TOHOシネマズ渋谷",
        "chain": "TOHOシネマズ",
        "location": "渋谷スカイ",
        "address": "東京都渋谷区渋谷2-24-1",
        "phone": "03-5467-5773",
        "website": "https://hlo.tohotheater.jp/",
        "prefecture": "東京都",
        "city": "渋谷区",
        "latitude": 35.658584,
        "longitude": 139.701608,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00",
        "updatedAt": "2024-01-01T00:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 5
  }
}
```

参照: `TheaterController.java:38-64`

### 9.2 都道府県一覧

```http
GET /theaters/prefectures
```

**説明**: 劇場が登録されている都道府県の一覧を取得

**認証**: 不要

**レスポンス例**:

✅ **200 OK**
```json
{
  "success": true,
  "message": "Prefectures retrieved successfully",
  "data": [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県"
  ]
}
```

参照: `TheaterController.java:87-96`

## 10. エラーレスポンス

### 10.1 バリデーションエラー

```json
{
  "success": false,
  "message": "Rating must be between 0.5 and 5.0",
  "data": null
}
```

### 10.2 認証エラー

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

### 10.3 認可エラー

```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```

### 10.4 リソース未発見

```json
{
  "success": false,
  "message": "Viewing record not found",
  "data": null
}
```

### 10.5 サーバーエラー

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

## 11. レート制限・制約

### 11.1 ページネーション制限

- 最大ページサイズ: 100
- デフォルトページサイズ: 10-20（エンドポイントによる）

### 11.2 データ制限

- 鑑賞記録レビュー: 最大2,000文字
- ユーザー自己紹介: 最大500文字
- 映画タイトル: 最大255文字

### 11.3 JWT制限

- トークン有効期限: 24時間
- リフレッシュ機能: 未実装（再ログインが必要）

## 12. 外部API連携

### 12.1 TMDb API連携

- **Base URL**: https://api.themoviedb.org/3
- **認証**: APIキー認証
- **レート制限**: TMDb側の制限に準拠
- **キャッシュ**: 30分間のインメモリキャッシュ

### 12.2 連携エンドポイント

| cineTrack API | TMDb API | 説明 |
|---------------|----------|------|
| GET /movies/trending | /trending/movie/day | 日次トレンド映画 |
| GET /movies/popular | /movie/popular | 人気映画 |
| GET /movies/now-playing | /movie/now_playing | 現在上映中 |
| GET /movies/search | /search/movie | 映画検索 |
| GET /movies/{id} | /movie/{id} | 映画詳細 |

---

**作成日**: 2025-07-23  
**対象バージョン**: cineTrack v1.0  
**更新履歴**: 初版作成  
**参照コントローラー**: 
- `AuthController.java` - 認証機能
- `MovieController.java` - 映画情報
- `ViewingRecordController.java` - 鑑賞記録
- `SocialController.java` - ソーシャル機能
- `UserController.java` - ユーザー管理
- `WishlistController.java` - ウィッシュリスト
- `TheaterController.java` - 劇場情報
- `StatsController.java` - 統計情報