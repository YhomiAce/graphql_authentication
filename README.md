

## Description

Develop a RESTful API service using NestJS with TypeScript that supports user authentication (standard and biometric), registration, and utilizes Prisma as the ORM. The API should be exposed through GraphQL.

## Prerequisites
<li>Node.js</li>
<li>Docker</li>
<li>Docker Compose</li>


## Getting Started
1. Clone this repository:

```bash
$ git clone https://github.com/YhomiAce/graphql_authentication.git
```

2. Navigate to the project directory:

```bash
$ cd graphql_authentication
```

3. Create .env from .env.example:

```bash
$ cp .env.example .env
```

4. Build the Docker images and start the containers:

```bash
$ docker-compose up -d --build
```

5. Installation:

```bash
$ npm install
```

6. Run Migrations:

```bash
$ npx prisma migrate dev
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

```
