import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password: string;
}
