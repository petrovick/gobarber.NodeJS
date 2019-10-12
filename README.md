## Docker Container

MySQL database instance

```bash
docker run --name database -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

Mongo database instance

```bash
docker run --name mongobarber -p 27017:27017 -d -t mongo
```

Create a container to run redis to process queue

```bash
docker run --name redisbarber -p 6379:6379 -d -t redis:alpine
```

To run the Queue Process, that was configured on package.json "queue": "nodemon src/queue.js", run the following command

```bash
yarn queue

## Running eslint to the whole project

```bash
yarn eslint --fix src --ext .js
```

## Migrations

### Criar Migrations
```bash
yarn sequelize migration:create --name=create-users
```

### Rodar Migration Criada
```bash
yarn sequelize db:migrate
```
### Cancelar Migration criada
```bash
yarn sequelize db:migrate:undo
```
