# Conquerer Project
RESTful API services with Node.js-Express and PostgreSQL

# 1 - Project setup with docker
Project installation steps with Docker

### Local mode

```bash

$ cd /src/config/
$ cp .local.env .env
$ cd /docker/
$ docker-compose -f docker-compose.yml -f docker-compose.local.yml --project-name conquerer --env-file ./config/.local.env up --build -d

```
### Dev mode

```bash

$ cd /src/config/
$ cp .dev.env .env
$ cd /docker/
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml --project-name conquerer --env-file ./config/.dev.env up --build -d

```

### Production mode

```bash

$ cd /src/config/
$ cp .prod.env .env
$ cd /docker/
$ docker-compose --project-name conquerer --env-file ./config/.env up --build -d

```

# 2 - Project setup database with sequelize-cli package
Project installation database steps with sequelize-cli package

```bash

$ cd app/src/
$ cp .dev.env .env
$ npx sequelize-cli db:migrate
$ npx sequelize-cli db:seed:all

```

# Postman Document and API services Collections
postman/Conquerer RESTFul API service Document.postman_collection.json