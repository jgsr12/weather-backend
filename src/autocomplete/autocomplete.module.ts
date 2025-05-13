import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteController } from './autocomplete.controller';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  providers: [AutocompleteService],
  controllers: [AutocompleteController],
})
export class AutocompleteModule {}
