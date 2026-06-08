import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [DatabaseModule, HotelsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
