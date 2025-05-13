import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  private readonly cacheKey = 'favorites:list';

  constructor(
    @InjectRepository(Favorite)
    private readonly repo: Repository<Favorite>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async findAll(): Promise<Favorite[]> {
    const cached = await this.cache.get<Favorite[]>(this.cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const list = await this.repo.find();
      await this.cache.set(this.cacheKey, list, 300);
      return list;
    } catch (error) {
      throw new HttpException(
        'Error al obtener favoritos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(dto: CreateFavoriteDto): Promise<Favorite> {
    try {
      const fav = this.repo.create({ city: dto.city.trim() });
      const saved = await this.repo.save(fav);
      await this.cache.del(this.cacheKey);
      return saved;
    } catch (error) {
      throw new HttpException(
        'Error al agregar favorito',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(city: string): Promise<void> {
    try {
      const res = await this.repo.delete({ city: city.trim() });
      if (!res.affected) {
        throw new HttpException(
          'Ciudad no existe en favoritos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.cache.del(this.cacheKey);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error al eliminar favorito',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
