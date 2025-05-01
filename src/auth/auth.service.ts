import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { LoginAuthDto } from './dto/login-auth-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const userAuth = await this.prisma.user.findUnique({
        where: { email: createAuthDto.email },
      });

      if (userAuth) {
        throw new ConflictException('El usuario con ese correo ya existe');
      }

      const passwordHash = await bcrypt.hash(createAuthDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          name: createAuthDto.name,
          email: createAuthDto.email,
          password: passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const responseUserData: ResponseAuthDto = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return {
        message: 'Usuario creado exitosamente',
        user: responseUserData,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Error al crear el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    try {
      const userAuth = await this.prisma.user.findUnique({
        where: { email: loginAuthDto.email },
      });

      if (!userAuth) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      const passwordMatch = await bcrypt.compare(
        loginAuthDto.password,
        userAuth.password,
      );

      if (!passwordMatch) {
        throw new HttpException(
          'Contraseña incorrecta',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        message: 'Inicio de sesión exitoso',
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Error de inicio de sesión',
        HttpStatus.INTERNAL_SERVER_ERROR, // Código 500 para error del servidor
      );
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      return {
        message: 'Usuarios encontrados exitosamente',
        users,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Error al obtener los usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Usuario encontrado',
        user,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Error al obtener el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          name: updateAuthDto.name,
          email: updateAuthDto.email,
        },
      });

      return {
        message: 'Usuario actualizado exitosamente',
        user,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Error al actualizar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });

      return {
        message: 'Usuario eliminado exitosamente',
        user,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Error al eliminar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
