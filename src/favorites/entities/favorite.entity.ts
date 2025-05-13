import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('favorites')
@Unique(['city'])
export class Favorite {
  @PrimaryGeneratedColumn() id!: number;

  @Column() city!: string;
}
