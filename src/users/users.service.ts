import { Injectable, HttpException, HttpStatus, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly cacheKey = 'users:list';

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async findAll(): Promise<User[]> {
    const cached = await this.cache.get<User[]>(this.cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const users = await this.repo.find();
      await this.cache.set(this.cacheKey, users, 300);
      return users;
    } catch {
      throw new HttpException(
        'Error al obtener usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = this.repo.create(dto);
      const saved = await this.repo.save(user);
      await this.cache.del(this.cacheKey);
      return saved;
    } catch {
      throw new HttpException(
        'Error al crear usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findOne(id: number): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async setCurrentRefreshToken(
    token: string,
    userId: number,
  ): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.currentHashedRefreshToken = token;
    await this.repo.save(user);
  }

  async removeRefreshToken(userId: number): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.currentHashedRefreshToken = null;
    await this.repo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    try {
      const result: UpdateResult = await this.repo.update(id, dto);
      if (result.affected === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
      await this.cache.del(this.cacheKey);

      const updated = await this.repo.findOne({ where: { id } });
      if (!updated) {
        throw new NotFoundException('Usuario no encontrado tras actualizar');
      }
      return updated;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new HttpException(
        'Error al actualizar usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.repo.delete(id);
      await this.cache.del(this.cacheKey);
      return result;
    } catch {
      throw new HttpException(
        'Error al eliminar usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
