import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  const mockUsers = { create: jest.fn(), findByEmail: jest.fn(), setCurrentRefreshToken: jest.fn(), removeRefreshToken: jest.fn(), update: jest.fn(), findOne: jest.fn() };
  const mockJwt = { sign: jest.fn() };
  const mockConfig = { get: jest.fn().mockReturnValue('1h') };
  const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsers },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('register crea un usuario y devuelve nombres', async () => {
    mockUsers.create.mockResolvedValue({ id: 1, email: 'c@d', firstName: 'Juan', lastName: 'Soto' });
    const out = await service.register('x@y', 'pwd', 'Juan', 'Soto');
    expect(out).toMatchObject({ email: 'x@y', firstName: 'Juan', lastName: 'Soto' });
  });
});
