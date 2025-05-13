import { Controller, Post, Body, Res, UseGuards, Req, Get, Patch } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService }       from './auth.service';
import { RegisterDto }       from './dto/register.dto';
import { LoginDto }          from './dto/login.dto';
import { JwtAuthGuard }      from './guards/jwt-auth.guard';
import { JwtRefreshGuard }   from './guards/jwt-refresh.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

type RequestWithUser = Request & { user: { userId: number; email: string; firstName: string; lastName: string } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(dto.email, dto.password, res);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.refreshTokens(req.user.userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.logout(req.user.userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto
  ) {
    const userId = req.user.userId;
    const updated = await this.auth.updateProfile(userId, dto.firstName, dto.lastName);
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return req.user;
  }
}
