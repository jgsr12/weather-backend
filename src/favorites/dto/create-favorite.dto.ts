import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  city!: string;
}
