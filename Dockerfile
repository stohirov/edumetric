# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -q dependency:go-offline
COPY src/ src/
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -q -DskipTests package \
 && mv target/backend-*.jar target/app.jar

FROM eclipse-temurin:25-jre AS runtime
RUN groupadd --system --gid 1001 spring \
 && useradd --system --uid 1001 --gid spring --shell /usr/sbin/nologin spring
WORKDIR /app
COPY --from=build /workspace/target/app.jar app.jar
USER spring:spring
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseZGC -XX:+ZGenerational"
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["sh", "-c", "wget -q -O - http://localhost:8080/actuator/health | grep -q '\"status\":\"UP\"' || exit 1"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
