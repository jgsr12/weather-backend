import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getWeather(city: string): Promise<WeatherResponseDto> {
    if (!city?.trim()) {
      throw new HttpException('El parámetro city es obligatorio', HttpStatus.BAD_REQUEST);
    }

    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cache.get<WeatherResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = 'http://api.weatherapi.com/v1/current.json';
      const params = { key: process.env.WEATHER_API_KEY, q: city };
      const resp = await firstValueFrom(this.http.get(url, { params }));
      const data = resp.data;

      const result: WeatherResponseDto = {
        city: data.location.name,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        wind_kph: data.current.wind_kph,
        humidity: data.current.humidity,
        localtime: data.location.localtime,
      };

      await this.cache.set(cacheKey, result, 300);
      return result;
    } catch (err: any) {
      if (err.response?.status === 400) {
        throw new NotFoundException('Ciudad no encontrada');
      }
      throw new HttpException('Error al consultar WeatherAPI', HttpStatus.BAD_GATEWAY);
    }
  }
}
