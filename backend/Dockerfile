FROM openjdk:17-jdk-slim

WORKDIR /app

# 必要なファイルをすべてコピー
COPY . .

# Mavenラッパーに実行権限を付与
RUN chmod +x ./mvnw

# 依存関係をダウンロードしてビルド
RUN ./mvnw clean package -DskipTests

# Railway対応: ポート環境変数の使用
EXPOSE 8080
ENV PORT=8080

# JVMメモリ最適化（Railway無料プランの512MB制限対応）
CMD ["java", "-Xmx400m", "-Xms200m", "-jar", "target/cinetrack-backend-0.0.1-SNAPSHOT.jar"]