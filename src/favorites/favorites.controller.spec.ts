import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  const mockRepo = {
    find: jest.fn().mockResolvedValue([{ id: 1, city: 'London' }]),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockResolvedValue({ id: 2, city: 'Paris' }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FavoritesController],
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: mockRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FavoritesController>(FavoritesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
