# システム構成図・アーキテクチャ設計書

## 1. システム構成概要

### 1.1 全体システム構成図

```mermaid
graph TB
    subgraph "User Interface"
        U1[Web Browser]
        U2[Mobile Browser]
    end
    
    subgraph "Frontend Layer (React SPA)"
        F1[React Application<br/>Port: 3000]
        F2[Material-UI Components]
        F3[React Router]
        F4[Axios HTTP Client]
        F5[Context API<br/>State Management]
    end
    
    subgraph "API Gateway Layer"
        G1[Spring Boot API Server<br/>Port: 8080<br/>Context: /api]
    end
    
    subgraph "Security Layer"
        S1[JWT Authentication]
        S2[Spring Security]
        S3[CORS Configuration]
    end
    
    subgraph "Business Logic Layer"
        B1[Controllers<br/>8 REST Controllers]
        B2[Services<br/>7 Business Services]
        B3[DTOs<br/>15 Data Transfer Objects]
    end
    
    subgraph "Data Access Layer"
        D1[JPA Repositories<br/>5 Repository Interfaces]
        D2[Hibernate ORM]
        D3[Entity Classes<br/>5 JPA Entities]
    end
    
    subgraph "Database Layer"
        DB1[PostgreSQL 15<br/>Port: 5432<br/>Production]
        DB2[H2 Database<br/>Testing]
    end
    
    subgraph "External Services"
        E1[TMDb API<br/>Movie Database]
        E2[Theater Information<br/>Service]
    end
    
    subgraph "Infrastructure"
        I1[Docker Containers]
        I2[Docker Compose]
        I3[Volume Storage]
    end
    
    U1 -.->|HTTPS/HTTP| F1
    U2 -.->|HTTPS/HTTP| F1
    F1 -->|Component Rendering| F2
    F1 -->|SPA Routing| F3
    F1 -->|HTTP Requests<br/>JWT Bearer Token| F4
    F1 -->|State Management| F5
    
    F4 -->|REST API Calls| G1
    G1 -->|Request Filtering| S1
    S1 -->|Authentication| S2
    S2 -->|CORS Validation| S3
    
    S3 -->|Authorized Requests| B1
    B1 -->|Business Logic| B2
    B1 <-->|Data Mapping| B3
    B2 -->|Data Operations| D1
    
    D1 -->|ORM Mapping| D2
    D2 -->|Entity Management| D3
    D2 -->|SQL Queries| DB1
    D2 -.->|Test Queries| DB2
    
    B2 -->|External API Calls| E1
    B2 -.->|Theater Data| E2
    
    G1 -.->|Container Runtime| I1
    F1 -.->|Container Runtime| I1
    DB1 -.->|Container Runtime| I1
    I1 -->|Orchestration| I2
    DB1 -->|Data Persistence| I3
```

### 1.2 ネットワーク構成図

```mermaid
graph LR
    subgraph "Development Environment"
        subgraph "Host Network"
            H1[localhost:3000<br/>React Dev Server]
            H2[localhost:8080<br/>Spring Boot API]
            H3[localhost:5432<br/>PostgreSQL]
        end
        
        subgraph "Docker Network"
            D1[frontend container]
            D2[backend container]
            D3[db container]
        end
    end
    
    subgraph "External Networks"
        E1[api.themoviedb.org<br/>TMDb API]
    end
    
    H1 -.->|Development Mode| D1
    H2 -.->|Development Mode| D2
    H3 -.->|Development Mode| D3
    
    D1 <-->|HTTP| D2
    D2 <-->|JDBC| D3
    D2 <-->|HTTPS| E1
    
    H1 -->|CORS Allowed| H2
    H2 -->|JDBC Connection| H3
    H2 -->|API Requests| E1
```

## 2. レイヤードアーキテクチャ

### 2.1 アプリケーション層構成

```mermaid
graph TB
    subgraph "Presentation Layer"
        P1[Pages<br/>14 React Pages]
        P2[Components<br/>Reusable UI Components]
        P3[Context Providers<br/>AuthContext]
        P4[Routing<br/>Protected Routes]
    end
    
    subgraph "API Contract Layer"
        A1[REST Controllers<br/>AuthController<br/>MovieController<br/>ViewingRecordController<br/>SocialController<br/>WishlistController<br/>TheaterController<br/>StatisticsController]
        A2[Request/Response DTOs<br/>15 Data Transfer Objects]
        A3[Exception Handling<br/>Global Error Handler]
    end
    
    subgraph "Business Logic Layer"
        B1[Service Classes<br/>UserService<br/>MovieService<br/>ViewingRecordService<br/>SocialService<br/>WishlistService<br/>TheaterService<br/>StatisticsService]
        B2[Domain Logic<br/>Validation<br/>Business Rules]
        B3[External API Integration<br/>TMDb Service]
    end
    
    subgraph "Data Access Layer"
        D1[Repository Interfaces<br/>UserRepository<br/>ViewingRecordRepository<br/>FollowRepository<br/>WishlistRepository<br/>TheaterRepository]
        D2[JPA Specifications<br/>Custom Queries]
        D3[Entity Mapping<br/>ORM Configuration]
    end
    
    subgraph "Persistence Layer"
        PE1[JPA Entities<br/>User<br/>ViewingRecord<br/>Theater<br/>Follow<br/>Wishlist]
        PE2[Database Schema<br/>Tables & Constraints]
        PE3[Data Storage<br/>PostgreSQL]
    end
    
    P1 --> A1
    P2 --> A1
    P3 --> A1
    P4 --> A1
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    
    B1 --> D1
    B2 --> D1
    B3 --> D1
    
    D1 --> PE1
    D2 --> PE1
    D3 --> PE1
    
    PE1 --> PE2
    PE2 --> PE3
```

### 2.2 フロントエンド アーキテクチャ

```mermaid
graph TB
    subgraph "React Application Architecture"
        subgraph "Routing Layer"
            R1[App.js<br/>Main Router]
            R2[ProtectedRoute<br/>Authentication Guard]
            R3[Route Definitions<br/>14 Page Routes]
        end
        
        subgraph "State Management"
            S1[AuthContext<br/>User Authentication State]
            S2[Local Component State<br/>useState, useEffect]
            S3[Form State<br/>Controlled Components]
        end
        
        subgraph "UI Components"
            U1[Pages<br/>Dashboard, Movies, etc.]
            U2[Layout Components<br/>Navbar, Layout]
            U3[Functional Components<br/>TheaterSearch, etc.]
            U4[Material-UI Components<br/>Buttons, Cards, etc.]
        end
        
        subgraph "Service Layer"
            SV1[API Services<br/>Axios Configuration]
            SV2[Authentication Service<br/>Token Management]
            SV3[HTTP Interceptors<br/>Request/Response]
        end
        
        subgraph "Utilities"
            UT1[Test Utilities<br/>Mocks, Test Helpers]
            UT2[Constants<br/>API Endpoints]
            UT3[Helpers<br/>Data Formatting]
        end
    end
    
    R1 --> R2
    R2 --> R3
    R3 --> U1
    
    S1 --> U1
    S1 --> U2
    S2 --> U1
    S3 --> U1
    
    U1 --> U4
    U2 --> U4
    U3 --> U4
    
    U1 --> SV1
    U2 --> SV1
    SV1 --> SV2
    SV1 --> SV3
    
    SV1 -.-> UT2
    U1 -.-> UT3
```

## 3. データフロー アーキテクチャ

### 3.1 認証データフロー

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant R as React App
    participant A as AuthContext
    participant S as Spring Boot API
    participant DB as Database
    participant JWT as JWT Service
    
    U->>R: Login Request
    R->>A: updateAuthState(loading=true)
    A->>S: POST /api/auth/login
    S->>DB: SELECT user WHERE username
    DB-->>S: User entity
    S->>JWT: generateToken(user)
    JWT-->>S: JWT token
    S-->>A: {token, user}
    A->>A: localStorage.setItem('token')
    A->>R: updateAuthState(user, token)
    R-->>U: Redirect to Dashboard
```

### 3.2 データ操作フロー

```mermaid
sequenceDiagram
    participant C as React Component
    participant API as Axios Service
    participant CTRL as Controller
    participant SVC as Service
    participant REPO as Repository
    participant DB as PostgreSQL
    
    C->>API: createViewingRecord(data)
    API->>CTRL: POST /api/viewing-records
    CTRL->>CTRL: @Valid RequestDTO
    CTRL->>SVC: createRecord(dto)
    SVC->>SVC: validateBusinessRules()
    SVC->>REPO: save(entity)
    REPO->>DB: INSERT INTO viewing_records
    DB-->>REPO: Generated ID
    REPO-->>SVC: Saved entity
    SVC-->>CTRL: ResponseDTO
    CTRL-->>API: HTTP 201 Created
    API-->>C: Success response
    C->>C: updateLocalState()
```

## 4. セキュリティアーキテクチャ

### 4.1 認証・認可フロー

```mermaid
graph TB
    subgraph "Client Side Security"
        C1[React App]
        C2[AuthContext]
        C3[Local Storage<br/>JWT Token]
        C4[Axios Interceptors<br/>Bearer Token]
    end
    
    subgraph "Server Side Security"
        S1[Spring Security Filter Chain]
        S2[JWT Authentication Filter]
        S3[Authentication Manager]
        S4[User Details Service]
        S5[Method Security<br/>@PreAuthorize]
    end
    
    subgraph "Token Management"
        T1[JWT Token Generation]
        T2[Token Validation]
        T3[Token Expiration<br/>24 hours]
        T4[HMAC-SHA256 Signing]
    end
    
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 -->|Authorization Header| S1
    
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    
    S3 --> T2
    T2 --> T4
    T1 --> T3
    T1 --> T4
```

### 4.2 CORS設定とAPI保護

```mermaid
graph LR
    subgraph "Frontend Origin"
        F1[http://localhost:3000<br/>React Dev Server]
    end
    
    subgraph "CORS Configuration"
        C1[CorsConfigurationSource]
        C2[Allowed Origins<br/>localhost:3000]
        C3[Allowed Methods<br/>GET, POST, PUT, DELETE]
        C4[Allowed Headers<br/>Authorization, Content-Type]
    end
    
    subgraph "API Protection"
        A1[Public Endpoints<br/>/auth/login<br/>/auth/register]
        A2[Protected Endpoints<br/>/viewing-records/**<br/>/social/**<br/>/wishlist/**]
        A3[JWT Validation<br/>Required for Protected]
    end
    
    F1 -->|Preflight OPTIONS| C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    
    F1 -->|Authenticated Requests| A2
    F1 -->|Public Requests| A1
    A2 --> A3
```

## 5. 外部連携アーキテクチャ

### 5.1 TMDb API連携

```mermaid
graph TB
    subgraph "cineTrack Backend"
        B1[MovieController]
        B2[MovieService]
        B3[TMDb API Client<br/>WebFlux]
        B4[Response Mapping<br/>TMDb DTO → Internal DTO]
    end
    
    subgraph "TMDb API"
        T1[https://api.themoviedb.org/3]
        T2[/trending/movie/day]
        T3[/search/movie]
        T4[/movie/{id}]
        T5[API Key Authentication]
    end
    
    subgraph "Data Flow"
        D1[Movie Search Request]
        D2[API Response Caching]
        D3[Error Handling<br/>Retry Logic]
    end
    
    B1 --> B2
    B2 --> B3
    B3 -->|HTTPS Requests| T1
    T1 --> T2
    T1 --> T3
    T1 --> T4
    T1 --> T5
    
    B3 --> B4
    B4 --> D2
    B3 --> D3
    
    D1 --> B1
```

### 5.2 データ同期・整合性

```mermaid
graph TB
    subgraph "Movie Data Synchronization"
        M1[TMDb Movie ID<br/>Primary Reference]
        M2[Local Movie Cache<br/>viewing_records.movie_title]
        M3[Data Consistency Check]
        M4[Periodic Sync Job<br/>Future Enhancement]
    end
    
    subgraph "Theater Data Management"
        TH1[Theater Master Data<br/>theaters table]
        TH2[Location-based Search<br/>Prefecture/City]
        TH3[Chain Information<br/>Theater Groups]
    end
    
    subgraph "User Data Integrity"
        U1[User Profile Data]
        U2[Viewing Records<br/>User Relationship]
        U3[Social Connections<br/>Follow Relationships]
        U4[Wishlist Items<br/>User-Movie Mapping]
    end
    
    M1 --> M2
    M2 --> M3
    M3 -.-> M4
    
    TH1 --> TH2
    TH2 --> TH3
    
    U1 --> U2
    U2 --> U3
    U2 --> U4
```

## 6. パフォーマンス・スケーラビリティ

### 6.1 データアクセス最適化

```mermaid
graph TB
    subgraph "Database Optimization"
        D1[JPA Query Optimization<br/>@Query Annotations]
        D2[Pagination Support<br/>Pageable Interface]
        D3[Lazy Loading<br/>Entity Relationships]
        D4[Connection Pooling<br/>HikariCP]
    end
    
    subgraph "Caching Strategy"
        C1[HTTP Response Caching<br/>Browser Cache]
        C2[Static Asset Caching<br/>React Build]
        C3[Database Query Caching<br/>JPA Second Level Cache]
        C4[External API Caching<br/>TMDb Response Cache]
    end
    
    subgraph "Frontend Optimization"
        F1[React Component Optimization<br/>useMemo, useCallback]
        F2[Code Splitting<br/>Dynamic Imports]
        F3[Image Optimization<br/>TMDb Image URLs]
        F4[Bundle Size Optimization<br/>Tree Shaking]
    end
    
    D1 --> D4
    D2 --> D4
    D3 --> D4
    
    C3 --> D1
    C4 --> C3
    C1 --> C2
    
    F1 --> F2
    F2 --> F3
    F3 --> F4
```

## 7. 拡張性・保守性

### 7.1 モジュール分離設計

```mermaid
graph TB
    subgraph "Core Modules"
        CORE1[Authentication Module<br/>JWT + Spring Security]
        CORE2[User Management Module<br/>Profile + Social]
        CORE3[Movie Data Module<br/>TMDb Integration]
    end
    
    subgraph "Feature Modules"
        FEAT1[Viewing Records Module<br/>CRUD + Statistics]
        FEAT2[Social Features Module<br/>Follow + Activity Feed]
        FEAT3[Wishlist Module<br/>Movie Bookmarking]
        FEAT4[Theater Module<br/>Location + Search]
    end
    
    subgraph "Infrastructure Modules"
        INFRA1[Database Configuration<br/>JPA + PostgreSQL]
        INFRA2[External API Client<br/>WebFlux + TMDb]
        INFRA3[Security Configuration<br/>CORS + JWT]
        INFRA4[Testing Framework<br/>JUnit + Mockito]
    end
    
    CORE1 --> FEAT1
    CORE1 --> FEAT2
    CORE2 --> FEAT1
    CORE2 --> FEAT2
    CORE3 --> FEAT1
    CORE3 --> FEAT3
    
    FEAT1 --> INFRA1
    FEAT2 --> INFRA1
    FEAT3 --> INFRA1
    FEAT4 --> INFRA1
    
    CORE3 --> INFRA2
    CORE1 --> INFRA3
    FEAT1 --> INFRA4
```

### 7.2 将来の拡張ポイント

```mermaid
graph TB
    subgraph "Current Architecture"
        C1[Monolithic Spring Boot]
        C2[Single PostgreSQL DB]
        C3[Direct TMDb Integration]
        C4[Simple File Storage]
    end
    
    subgraph "Future Enhancement Points"
        F1[Microservices Architecture<br/>Service Decomposition]
        F2[Database Sharding<br/>Read Replicas]
        F3[API Gateway<br/>Rate Limiting + Caching]
        F4[CDN Integration<br/>Image + Static Assets]
        F5[Message Queue<br/>Async Processing]
        F6[Redis Cache<br/>Session + Query Cache]
    end
    
    subgraph "Scalability Features"
        S1[Load Balancer<br/>Multiple Instances]
        S2[Container Orchestration<br/>Kubernetes]
        S3[Monitoring + Logging<br/>ELK Stack]
        S4[Auto Scaling<br/>Cloud Native]
    end
    
    C1 -.-> F1
    C2 -.-> F2
    C3 -.-> F3
    C4 -.-> F4
    
    F1 --> S1
    F2 --> S2
    F3 --> S3
    F4 --> S4
    
    F1 -.-> F5
    F2 -.-> F6
```

---

**作成日**: 2025-07-23  
**対象バージョン**: cineTrack v1.0  
**参照ファイル**: 
- `/backend/src/main/java/com/cinetrack/` - 全コントローラー・サービス・エンティティ
- `/frontend/src/` - React コンポーネント・ページ・コンテキスト
- `/docker-compose.yml` - インフラ構成
- `/backend/src/main/resources/application.yml` - 設定情報