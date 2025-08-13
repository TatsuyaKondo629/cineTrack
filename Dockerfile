# マルチステージビルド: Mavenビルドステージ
FROM maven:3.9.4-openjdk-17 AS build

WORKDIR /app

# pom.xmlとソースコードをコピー
COPY backend/pom.xml .
COPY backend/src ./src

# Mavenビルド実行（テストスキップでビルド時間短縮）
RUN mvn clean package -DskipTests

# 実行ステージ: 軽量なJDKイメージ
FROM openjdk:17-jdk-slim

WORKDIR /app

# ビルドステージからJARファイルをコピー
COPY --from=build /app/target/cinetrack-backend-0.0.1-SNAPSHOT.jar app.jar

# Railway対応: ポート環境変数の使用
EXPOSE 8080
ENV PORT=8080

# JVMメモリ最適化（Railway無料プランの512MB制限対応）
CMD ["java", "-Xmx400m", "-Xms200m", "-jar", "app.jar"]