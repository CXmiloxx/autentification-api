import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { LoginAuthDto } from './dto/login-auth-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
  async login(
    loginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ): Promise<Response> {
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

      const payload = { id: userAuth.id };

      const token = this.jwtService.sign(payload);

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 36000 * 1000,
      });

      return res.status(HttpStatus.OK).json({
        message: 'Inicio de sesión exitoso',
      });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Error de inicio de sesión',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyToken(token: string, res: Response) {
    try {
      const decoded = this.jwtService.verify<ResponseAuthDto>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error instanceof Error ? error.message : 'Token inválido',
      });
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
