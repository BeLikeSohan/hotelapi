## Description

Hotel Discovery API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Project setup

```bash
$ npm install
$ cp .env.example .env
```

## Docker setup

The Docker stack runs the NestJS API, PostgreSQL 18, and pgAdmin 4.

```bash
$ docker compose up --build
```

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

pgAdmin login:

- Email: `admin@hotelapi.local`
- Password: `admin_password`

Register the database server in pgAdmin with these values:

- Host: `postgres`
- Port: `5432`
- Database: `hotelapi`
- Username: `hotelapi`
- Password: `hotelapi_password`

## Database setup

TypeORM runs with `synchronize: false`, so the application does not create or update database tables on startup. Run migrations before starting the API against a fresh database.

For local development, start PostgreSQL first:

```bash
$ docker compose up -d postgres
```

Then apply the schema migration:

```bash
$ npm run migration:run
```

Load the mock hotel dataset:

```bash
$ npm run seed
```

The seed script is idempotent and can be rerun. It upserts hotels, rooms, amenities, join tables, and room availability dates.

To revert the most recent migration:

```bash
$ npm run migration:revert
```

## Compile and run the project

```bash
# first-time local database setup
$ docker compose up -d postgres
$ npm run migration:run
$ npm run seed

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# run specs serially, useful after adding or updating *.spec.ts files
$ npm test -- --runInBand

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
