import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly svc: WeatherService) {}

  @Get()
  async find(@Query('city') city: string): Promise<WeatherResponseDto> {
    if (!city?.trim()) {
      throw new BadRequestException('El parámetro city es obligatorio');
    }
    return this.svc.getWeather(city);
  }
}
