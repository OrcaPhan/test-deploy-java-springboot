# --- GIAI ĐOẠN 1: BUILD ---
# Sử dụng một image có sẵn Maven và JDK để build source code
# Chọn phiên bản Java 17, một phiên bản LTS phổ biến cho Spring Boot 3
FROM maven:3.9.6-eclipse-temurin-17-focal AS builder

# Tạo thư mục làm việc bên trong image
WORKDIR /app

# Tối ưu hóa caching của Docker:
# 1. Chỉ copy file pom.xml trước để tải các dependency
COPY backend/pom.xml .
RUN mvn dependency:go-offline

# 2. Copy toàn bộ source code còn lại
COPY backend/src ./src

# Build ứng dụng, bỏ qua các bài test để build nhanh hơn
# Kết quả sẽ là một file .jar trong thư mục /app/target
RUN mvn package -DskipTests


# --- GIAI ĐOẠN 2: RUN ---
# Sử dụng một image JRE (Java Runtime Environment) tối giản để chạy ứng dụng
# Image này nhỏ hơn nhiều so với image JDK ở trên
FROM eclipse-temurin:17-jre-jammy

# Tạo thư mục làm việc
WORKDIR /app

# Copy file .jar đã được build từ giai đoạn "builder" vào image hiện tại
# Đổi tên thành app.jar để dễ gọi
COPY --from=builder /app/target/*.jar app.jar

# Expose cổng 8080 mà Spring Boot đang chạy (theo application.properties)
# Render sẽ tự động map cổng này ra bên ngoài
EXPOSE 8080

# Lệnh để khởi chạy ứng dụng khi container được bật
# java -jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
