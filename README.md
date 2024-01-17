# Conquerer Project
RESTful API services with Node.js-Express and PostgreSQL

# Project setup with docker
Project installation steps with Docker

### local mode

```bash

$ cd docker/
$ docker-compose -f docker-compose.yml -f docker-compose.local.yml --project-name conquerer --env-file ./config/.env up --build -d

```
### Dev mode

```bash

$ cd docker/
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml --project-name conquerer --env-file ./config/.env up --build -d

```

### Production mode

```bash

$ cd docker/
$ docker-compose --project-name conquerer --env-file ./config/.env up --build -d

```