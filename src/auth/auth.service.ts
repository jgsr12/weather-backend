import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly rtCacheKey = (userId: number) => `auth:refresh:${userId}`;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private getCookieOptions(isRefresh = false) {
    const expiresIn = isRefresh
      ? this.config.get('JWT_REFRESH_TOKEN_EXPIRATION')
      : this.config.get('JWT_ACCESS_TOKEN_EXPIRATION');

    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: this.parseExpire(expiresIn!),
    };
  }

  private parseExpire(exp: string): number {
    const unit = exp.slice(-1);
    const amt = parseInt(exp.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return amt * 1000;
      case 'm':
        return amt * 60 * 1000;
      case 'h':
        return amt * 60 * 60 * 1000;
      case 'd':
        return amt * 24 * 60 * 60 * 1000;
      default:
        return parseInt(exp, 10);
    }
  }

  async register(
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
  ): Promise<{ id: number; email: string; firstName: string; lastName: string }> {
    const hashed = await bcrypt.hash(pass, 12);
    const user = await this.usersService.create({
      email,
      password: hashed,
      firstName,
      lastName,
    });
    return {
      id: user.id,
      email,
      firstName,
      lastName,
    };
  }

  async login(email: string, pass: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.setCurrentRefreshToken(refreshHash, user.id);
    await this.cache.set(
      this.rtCacheKey(user.id),
      refreshHash,
      this.parseExpire(this.config.get('JWT_REFRESH_TOKEN_EXPIRATION')!),
    );

    res.cookie('Authentication', accessToken, this.getCookieOptions());
    res.cookie('Refresh', refreshToken, this.getCookieOptions(true));

    return { id: user.id, email: user.email };
  }

  async logout(userId: number, res: Response) {
    await this.usersService.removeRefreshToken(userId);
    await this.cache.del(this.rtCacheKey(userId));

    res.clearCookie('Authentication', { path: '/' });
    res.clearCookie('Refresh', { path: '/' });
  }

  async refreshTokens(userId: number, res: Response) {
    let currentHash = await this.cache.get<string>(this.rtCacheKey(userId));

    if (!currentHash) {
      const user = await this.usersService.findOne(userId);
      if (!user?.currentHashedRefreshToken) {
        throw new UnauthorizedException();
      }
      currentHash = user.currentHashedRefreshToken;
      await this.cache.set(
        this.rtCacheKey(userId),
        currentHash,
        this.parseExpire(this.config.get('JWT_REFRESH_TOKEN_EXPIRATION')!),
      );
    }

    const payload = { sub: userId, email: '' };
    const newAccess = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    res.cookie('Authentication', newAccess, this.getCookieOptions());
    return { id: userId };
  }

  async updateProfile(userId: number, firstName: string, lastName: string) {
    const updatedUser = await this.usersService.update(userId, {
      firstName,
      lastName,
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    };
  }
}
