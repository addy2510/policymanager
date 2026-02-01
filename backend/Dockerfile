# Multi-stage Dockerfile for building and running the Spring Boot app
FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy only the files needed for a Maven build first (speeds up rebuilds)
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src src

# Build the application (skip tests for faster builds in CI/deploy)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar /app/app.jar

# Let Render set the port via PORT env; the app reads server.port from env
EXPOSE 8081

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
