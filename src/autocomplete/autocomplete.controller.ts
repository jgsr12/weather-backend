import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { AutocompleteService } from './autocomplete.service';

@Controller('autocomplete')
export class AutocompleteController {
  constructor(private readonly svc: AutocompleteService) {}

  @Get()
  async find(@Query('query') q: string): Promise<string[]> {
    if (!q?.trim()) {
      throw new BadRequestException('El parámetro query es obligatorio');
    }
    return this.svc.suggest(q);
  }
}
