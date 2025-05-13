import { Module }                from '@nestjs/common';
import { JwtModule }             from '@nestjs/jwt';
import { PassportModule }        from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }         from '@nestjs/typeorm';
import { CacheModule }           from '@nestjs/cache-manager';

import { AuthService }           from './auth.service';
import { AuthController }        from './auth.controller';
import { UsersModule }           from '../users/users.module';
import { JwtStrategy }           from './strategies/jwt.strategy';
import { JwtRefreshStrategy }    from './strategies/jwt-refresh.strategy';
import { User }                  from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: cs.get('JWT_ACCESS_TOKEN_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    CacheModule.register({
      ttl: 300,
      max: 1000,
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
