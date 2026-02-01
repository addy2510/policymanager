# Backend — MySQL & Render setup

This document explains how to configure MySQL for local development and for deployment on Render.

Required environment variables (set in Render dashboard → Environment):

- `SPRING_DATASOURCE_URL` — JDBC URL, e.g. `jdbc:mysql://HOST:3306/policy_manager?useSSL=false&serverTimezone=UTC`
- `SPRING_DATASOURCE_USERNAME` — DB username
- `SPRING_DATASOURCE_PASSWORD` — DB password
- `JWT_SECRET` — application JWT secret

Note: The app reads `server.port` from the `PORT` env var (already configured).

Local MySQL (Docker) quickstart:

1. Start a MySQL container:

```bash
docker run --name policy-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=policy_manager -p 3306:3306 -d mysql:8
```

2. Run the app locally (maven wrapper):

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/policy_manager?useSSL=false&serverTimezone=UTC \
SPRING_DATASOURCE_USERNAME=root \
SPRING_DATASOURCE_PASSWORD=root \
./mvnw spring-boot:run
```

Deploying on Render with an external MySQL service:

- Render currently offers managed Postgres; for MySQL you can either provision an external MySQL instance (RDS, PlanetScale, ClearDB, etc.) or run MySQL in a separate Render private service and expose network access between services.
- Set the three `SPRING_DATASOURCE_*` env vars in the Render service settings to point to your MySQL instance.
- Keep `SPRING_DATASOURCE_URL` as a full JDBC URL.

If you want, I can add a Flyway/Liquibase migration setup and example schema SQL.
