import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Amenity } from '../hotels/entities/amenity.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../hotels/entities/room.entity';
import { RoomAvailableDate } from '../hotels/entities/room-available-date.entity';

type DatabaseEnvironment = {
  databaseUrl?: string;
  host?: string;
  port?: number | string;
  database?: string;
  username?: string;
  password?: string;
  logging?: boolean;
};

export const entities = [Hotel, Room, Amenity, RoomAvailableDate];

export function createDataSourceOptions(
  environment: DatabaseEnvironment = {},
): DataSourceOptions {
  const url = environment.databaseUrl ?? process.env.DATABASE_URL;

  return {
    type: 'postgres',
    ...(url
      ? { url }
      : {
          host: environment.host ?? process.env.DATABASE_HOST ?? 'localhost',
          port: Number.parseInt(
            String(environment.port ?? process.env.DATABASE_PORT ?? '5432'),
            10,
          ),
          database:
            environment.database ?? process.env.DATABASE_NAME ?? 'hotelapi',
          username:
            environment.username ?? process.env.DATABASE_USER ?? 'hotelapi',
          password:
            environment.password ??
            process.env.DATABASE_PASSWORD ??
            'hotelapi_password',
        }),
    entities,
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    synchronize: false,
    logging: environment.logging ?? process.env.TYPEORM_LOGGING === 'true',
  };
}

export default new DataSource(createDataSourceOptions());
