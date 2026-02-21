import { IsString, IsNumber, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateTareaDto {
  @IsString()
  titulo!: string;

  @IsString()
  nombre!: string;

  @IsNumber()
  @IsOptional()
  storyPoints?: number;

  @IsNumber()
  @IsOptional()
  userCreadorId?: number;

  @IsOptional()
  @IsNumber()
  userAsignadoId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoriaIds?: number[];

  @IsDateString()
  @IsOptional()
  fechaEntrega?: Date;
}