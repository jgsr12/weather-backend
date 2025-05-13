// src/autocomplete/autocomplete.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AutocompleteController } from './autocomplete.controller';
import { AutocompleteService } from './autocomplete.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

describe('AutocompleteController', () => {
  let controller: AutocompleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, CacheModule.register()],
      controllers: [AutocompleteController],
      providers: [AutocompleteService],
    }).compile();

    controller = module.get<AutocompleteController>(AutocompleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
