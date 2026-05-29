# Build stage - usa Maven com JDK
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia pom primeiro pra aproveitar cache do Docker quando so o codigo muda
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage - JRE menor (sem ferramentas de build)
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080

# Healthcheck local do Docker (CAE tambem faz o seu)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
