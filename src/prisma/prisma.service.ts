import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Iniciando La conexion a la BD...');
    } catch (error) {
      this.logger.error('Error connecting to the database', error);
      console.error('Error al intentar conectarme a la BD:', error);
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Finalizando la conexion a la BD...');
    } catch (error) {
      this.logger.error('Error al intentar conectar a la BD', error);
      console.error('Error al finalizar la conexion a la BD', error);
    }
  }
}
