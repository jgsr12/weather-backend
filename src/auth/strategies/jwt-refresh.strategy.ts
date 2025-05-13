import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtRefreshSecret = config.get<string>('JWT_REFRESH_TOKEN_SECRET');
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Refresh, 
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
    });
  }

  async validate(payload: { sub: number; email: string }, req: Request) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.currentHashedRefreshToken)
      throw new UnauthorizedException();

    return { userId: payload.sub, email: payload.email };
  }
}
