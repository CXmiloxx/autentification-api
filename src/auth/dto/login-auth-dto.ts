import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  email: string;

  @IsEmail({}, { message: 'La contraseña no es válida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}
