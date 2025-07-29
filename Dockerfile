FROM openjdk:17-jdk-slim

WORKDIR /app

# backend ディレクトリから必要なファイルをコピー
COPY backend/mvnw ./mvnw
COPY backend/.mvn ./.mvn
COPY backend/pom.xml ./pom.xml

# Mavenラッパーに実行権限を付与
RUN chmod +x ./mvnw

# 依存関係をダウンロード（キャッシュ効率化）
RUN ./mvnw dependency:go-offline -B

# ソースコードをコピー
COPY backend/src ./src

# アプリケーションをビルド
RUN ./mvnw clean package -DskipTests

# Railway対応: ポート環境変数の使用
EXPOSE 8080
ENV PORT=8080

# JVMメモリ最適化（Railway無料プランの512MB制限対応）
CMD ["java", "-Xmx400m", "-Xms200m", "-jar", "target/cinetrack-backend-0.0.1-SNAPSHOT.jar"]