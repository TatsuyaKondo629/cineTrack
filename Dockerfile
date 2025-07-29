FROM openjdk:17-jdk-slim

WORKDIR /app

# 事前ビルドしたJARファイルをコピー
COPY backend/target/cinetrack-backend-0.0.1-SNAPSHOT.jar app.jar

# Railway対応: ポート環境変数の使用
EXPOSE 8080
ENV PORT=8080

# JVMメモリ最適化（Railway無料プランの512MB制限対応）
CMD ["java", "-Xmx400m", "-Xms200m", "-jar", "app.jar"]