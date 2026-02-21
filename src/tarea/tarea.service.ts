
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
  ) {}

  async create(createTareaDto: CreateTareaDto & { userCreadorId: number }): Promise<any> {
    const { titulo, nombre, storyPoints, userCreadorId, userAsignadoId, fechaEntrega, categoriaIds } = createTareaDto;

    // Iniciamos una transacción manual para asegurar que se cree la tarea y sus relaciones
    const queryRunner = this.tareaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      //Evaluamos que los story points no sean negativos
      if (storyPoints !== undefined && storyPoints < 0) {
          throw new BadRequestException('Los story points no pueden ser negativos');
      }

      // 2. Insertar la Tarea
      const resultTarea = await queryRunner.query(
        `INSERT INTO tarea (titulo, nombre, story_points, user_creador_id, user_asignado_id, fecha_entrega)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [titulo, nombre, storyPoints ?? 0, userCreadorId, userAsignadoId || null, fechaEntrega || null]
      );

      const nuevaTarea = resultTarea[0];

      // 3. Insertar las relaciones en la tabla intermedia TAREA_CATEGORIA
      if (categoriaIds && categoriaIds.length > 0) {
        for (const catId of categoriaIds) {
          await queryRunner.query(
            `INSERT INTO tarea_categoria (tarea_id, categoria_id) VALUES ($1, $2)`,
            [nuevaTarea.id, catId]
          );
        }
      }

      await queryRunner.commitTransaction();
      return nuevaTarea;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<any[]> {
    const sql = `
    SELECT 
      t.*, 
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', c.id, 
              'nombre', c.nombre, 
              'color', c.color
            )
          ORDER BY c.id
        ), '[]')
        FROM categoria c
        JOIN tarea_categoria tc ON c.id = tc.categoria_id
        WHERE tc.tarea_id = t.id
      ) AS categorias,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', com.id,
              'contenido', com.contenido,
              'fecha', com.fecha
            )
          ORDER BY com.fecha DESC
        ), '[]')
        FROM comentarios com
        WHERE com.tarea_comentada_id = t.id
      ) AS comentarios
    FROM tarea t
    ORDER BY t.created_at DESC;
    `;

    return await this.tareaRepository.query(sql);
  }

  async findAllByUserId(userId: number): Promise<any[]> {
    const sql = `
    SELECT 
      t.*, 
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', c.id, 
              'nombre', c.nombre, 
              'color', c.color
            )
          ORDER BY c.id
        ), '[]')
        FROM categoria c
        JOIN tarea_categoria tc ON c.id = tc.categoria_id
        WHERE tc.tarea_id = t.id
      ) AS categorias,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', com.id,
              'contenido', com.contenido,
              'fecha', com.fecha
            )
          ORDER BY com.fecha DESC
        ), '[]')
        FROM comentarios com
        WHERE com.tarea_comentada_id = t.id
      ) AS comentarios
    FROM tarea t
    WHERE t.user_creador_id = $1 OR t.user_asignado_id = $1
    ORDER BY t.created_at DESC;
    `;

    return await this.tareaRepository.query(sql, [userId]);
  }

  async findAllByEstado(estado: string): Promise<any[]> {
    const sql = `
    SELECT 
      t.*, 
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', c.id, 
              'nombre', c.nombre, 
              'color', c.color
            )
          ORDER BY c.id
        ), '[]')
        FROM categoria c
        JOIN tarea_categoria tc ON c.id = tc.categoria_id
        WHERE tc.tarea_id = t.id
      ) AS categorias,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', com.id,
              'contenido', com.contenido,
              'fecha', com.fecha
            )
          ORDER BY com.fecha DESC
        ), '[]')
        FROM comentarios com
        WHERE com.tarea_comentada_id = t.id
      ) AS comentarios
    FROM tarea t
    WHERE t.estado = $1
    ORDER BY t.created_at DESC;
    `;

    return await this.tareaRepository.query(sql, [estado]);
  }

  async findOne(id: number): Promise<any> {
    // Consulta en DML
    const result = await this.tareaRepository.query(
      ` SELECT 
          t.*, 
          (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'id', c.id, 
                  'nombre', c.nombre, 
                  'color', c.color
                )
              ORDER BY c.id
            ), '[]')
            FROM categoria c
            JOIN tarea_categoria tc ON c.id = tc.categoria_id
            WHERE tc.tarea_id = t.id
          ) AS categorias,
          (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'id', com.id,
                  'contenido', com.contenido,
                  'fecha', com.fecha
                )
              ORDER BY com.fecha DESC
            ), '[]')
            FROM comentarios com
            WHERE com.tarea_comentada_id = t.id
          ) AS comentarios
        FROM tarea t
        WHERE t.id = $1`,
      [id]
    );
    if (!result || result.length === 0) return null;
    // Opcional: puedes mapear el resultado a un objeto más amigable si lo deseas
    return result[0];
  }

 async update(id: number, updateTareaDto: UpdateTareaDto): Promise<any> {

    const tareaExistente = await this.findOne(id);
      if (!tareaExistente) {
        throw new NotFoundException(`La tarea con ID ${id} no existe`);
      }

    const { categoriaIds, ...datosTarea } = updateTareaDto;
    const queryRunner = this.tareaRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. ACTUALIZAR CAMPOS BÁSICOS DE LA TAREA
      const campos: string[] = [];
      const valores: any[] = [];

      // Mapeo de nombres de DTO a nombres de Columnas en DB
      const mapaColumnas = {
        titulo: 'titulo',
        nombre: 'nombre',
        storyPoints: 'story_points',
        userAsignadoId: 'user_asignado_id',
        fechaEntrega: 'fecha_entrega',
        estado: 'estado'
      };

      Object.keys(datosTarea).forEach((key) => {
        if (datosTarea[key] !== undefined && mapaColumnas[key]) {
          campos.push(mapaColumnas[key]);
          valores.push(datosTarea[key]);
        }
      });

      if (campos.length > 0) {
        const setStr = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');

        if (mapaColumnas['storyPoints'] && datosTarea['storyPoints'] !== undefined && datosTarea['storyPoints'] < 0) {
          throw new BadRequestException('Los story points no pueden ser negativos');
        }

        await queryRunner.query(
          `UPDATE tarea SET ${setStr} WHERE id = $${campos.length + 1}`,
          [...valores, id]
        );
      }

      // 2. ACTUALIZAR CATEGORÍAS (Sincronización manual)
      if (categoriaIds !== undefined) {
        // Borramos las asociaciones actuales
        await queryRunner.query(
          `DELETE FROM tarea_categoria WHERE tarea_id = $1`,
          [id]
        );

        // Insertamos las nuevas (si hay)
        if (categoriaIds.length > 0) {
          for (const catId of categoriaIds) {
            await queryRunner.query(
              `INSERT INTO tarea_categoria (tarea_id, categoria_id) VALUES ($1, $2)`,
              [id, catId]
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      
      // Devolvemos la tarea completa con sus nuevas categorías
      return await this.findOne(id);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    // Elimina la tarea usando SQL nativo
    await this.tareaRepository.query(
      `DELETE FROM tarea WHERE id = $1`,
      [id]
    );
  }
}
