import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { NotFoundException, HttpException } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('WeatherService', () => {
  let service: WeatherService;
  const mockCache = { get: jest.fn(), set: jest.fn() };
  const mockHttp = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WeatherService,
        { provide: HttpService, useValue: mockHttp },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('debe lanzar NotFoundException para ciudad inválida', async () => {
    const err = { response: { status: 400 } };
    mockHttp.get.mockReturnValue(throwError(() => err));
    await expect(service.getWeather('NoCity')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('debe devolver datos de clima', async () => {
    const fakeData = {
      location: { name: 'Paris', localtime: '2025-05-12 10:00' },
      current: {
        temp_c: 20,
        temp_f: 68,
        condition: { text: 'Sunny', icon: '/icon.png' },
        wind_kph: 5,
        humidity: 30,
      },
    };
    mockHttp.get.mockReturnValue(of({ data: fakeData }));
    mockCache.get.mockResolvedValue(null);

    const out = await service.getWeather('Paris');
    expect(out.city).toBe('Paris');
    expect(out.condition).toBe('Sunny');
    expect(mockCache.set).toHaveBeenCalled();
  });

  it('debe cachear resultados', async () => {
    const cached = { city: 'X', temp_c: 0, temp_f: 0, condition: '', icon: '', wind_kph: 0, humidity: 0, localtime: '' };
    mockCache.get.mockResolvedValue(cached);
    await expect(service.getWeather('X')).resolves.toEqual(cached);
  });

  it('debe propagar error 502 si falla API', async () => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('fail')));
    await expect(service.getWeather('a')).rejects.toThrow(HttpException);
  });
});
