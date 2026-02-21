import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importar estos
import { UsuarioModule } from './usuario/usuario.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { TareaModule } from './tarea/tarea.module'; // Importación limpia
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Cargar el ConfigModule
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // 2. Configuración asíncrona de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as any,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    UsuarioModule,
    CategoriaModule,
    ComentariosModule,
    TareaModule,
    AuthModule,
  ],
})
export class AppModule {}