# マルチステージビルド: Mavenビルドステージ
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Mavenをインストール
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# pom.xmlとソースコードをコピー
COPY backend/pom.xml .
COPY backend/src ./src

# Mavenビルド実行（テストスキップでビルド時間短縮）
RUN mvn clean package -DskipTests

# 実行ステージ: 軽量なJREイメージ
FROM eclipse-temurin:17-jre

WORKDIR /app

# ビルドステージからJARファイルをコピー
COPY --from=build /app/target/cinetrack-backend-0.0.1-SNAPSHOT.jar app.jar

# Railway対応: ポート環境変数の使用
EXPOSE 8080
ENV PORT=8080

# JVMメモリ最適化（Railway無料プランの512MB制限対応）
CMD ["java", "-Xmx400m", "-Xms200m", "-jar", "app.jar"]