import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AutocompleteService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async suggest(query: string): Promise<string[]> {
    if (!query?.trim()) {
      throw new BadRequestException('El parámetro query es obligatorio');
    }

    const key = `autocomplete:${query.toLowerCase()}`;
    const fromCache = await this.cache.get<string[]>(key);
    if (fromCache) return fromCache;

    try {
      const url = 'http://api.weatherapi.com/v1/search.json';
      const params = { key: process.env.WEATHER_API_KEY, q: query };
      const resp = await firstValueFrom(this.http.get<any>(url, { params }));
      const raw: Array<{ name: string; region: string; country: string }> = resp.data;

      const seen = new Set<string>();
      const suggestions = raw
        .filter(loc =>
          loc.name.toLowerCase().startsWith(query.toLowerCase()) ||
          loc.region.toLowerCase().startsWith(query.toLowerCase()),
        )
        .map(loc => {
          const q = query.toLowerCase();
          let label: string;
          if (loc.name.toLowerCase().startsWith(q)) label = loc.name;
          else if (loc.region.toLowerCase().startsWith(q)) label = loc.region;
          else label = loc.name;
          return `${label}, ${loc.country}`;
        })
        .filter(label => {
          if (seen.has(label)) return false;
          seen.add(label);
          return true;
        });

      await this.cache.set(key, suggestions, 300);
      return suggestions;
    } catch {
      throw new HttpException('Error en autocomplete', HttpStatus.BAD_GATEWAY);
    }
  }
}