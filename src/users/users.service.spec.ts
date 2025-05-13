import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';

describe('UsersService', () => {
  let service: UsersService;
  const mockRepo = {
    update: jest.fn(),
    findOne: jest.fn(),
  };
  const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('update retorna la entidad actualizada', async () => {
    mockRepo.update.mockResolvedValue({ affected: 1 });
    mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b', firstName: 'A', lastName: 'B' });
    await expect(service.update(1, { firstName: 'A', lastName: 'B' })).resolves.toEqual({
      id: 1,
      email: 'a@b',
      firstName: 'A',
      lastName: 'B',
    });
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('update lanza NotFoundException si no existe', async () => {
    mockRepo.update.mockResolvedValue({ affected: 0 });
    await expect(service.update(2, { firstName: '', lastName: '' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
