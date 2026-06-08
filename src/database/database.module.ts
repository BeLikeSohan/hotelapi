import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createDataSourceOptions } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        createDataSourceOptions({
          databaseUrl: configService.get<string>('DATABASE_URL'),
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          database: configService.get<string>('DATABASE_NAME'),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          logging: configService.get<string>('TYPEORM_LOGGING') === 'true',
        }),
    }),
  ],
})
export class DatabaseModule {}
