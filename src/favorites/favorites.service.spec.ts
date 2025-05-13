import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([{ id: 1, city: 'London' }]),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockResolvedValue({ id: 2, city: 'Paris' }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const mockCache = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns cached list when available', async () => {
    mockCache.get.mockResolvedValue([{ id: 3, city: 'Berlin' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 3, city: 'Berlin' }]);
    expect(mockCache.get).toHaveBeenCalledWith('favorites:list');
  });

  it('findAll returns repository data and caches it when cache is empty', async () => {
    mockCache.get.mockResolvedValue(null);
    await expect(service.findAll()).resolves.toEqual([{ id: 1, city: 'London' }]);
    expect(mockCache.set).toHaveBeenCalledWith('favorites:list', [{ id: 1, city: 'London' }], 300);
  });

  it('create adds a favorite and invalidates cache', async () => {
    const dto = { city: 'Paris' };
    const fav = await service.create(dto);
    expect(fav).toEqual({ id: 2, city: 'Paris' });
    expect(mockCache.del).toHaveBeenCalledWith('favorites:list');
  });

  it('remove deletes a favorite and invalidates cache', async () => {
    await expect(service.remove('London')).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith({ city: 'London' });
    expect(mockCache.del).toHaveBeenCalledWith('favorites:list');
  });

  it('remove throws NotFoundException if city not in favorites', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove('NoCity')).rejects.toThrow('Ciudad no existe en favoritos');
  });
});