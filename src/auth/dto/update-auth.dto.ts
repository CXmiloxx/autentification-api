import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsString({
    message: 'El nombre debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre no puede estar vacío',
  })
  name?: string;

  @IsString({
    message: 'El correo electrónico debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El correo electrónico no puede estar vacío',
  })
  email?: string;
}
