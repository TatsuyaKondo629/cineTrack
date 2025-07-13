FROM openjdk:17-jdk-slim

WORKDIR /app

# Mavenラッパーとpom.xmlをコピー
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 依存関係をダウンロード（キャッシュ効率化）
RUN ./mvnw dependency:go-offline -B

# ソースコードをコピー
COPY src src

# アプリケーションをビルド
RUN ./mvnw clean package -DskipTests

# 実行
EXPOSE 8080
CMD ["java", "-jar", "target/cinetrack-backend-0.0.1-SNAPSHOT.jar"]