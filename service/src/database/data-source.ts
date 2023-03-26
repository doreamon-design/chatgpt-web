import { DataSource } from 'typeorm'
import { entities } from './entity'

export const AppDataSource = new DataSource({
  type: (process.env.DB_ENGINE as any) || 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'chatgpt_web',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'chatgpt_web',
  synchronize: true,
  logging: process.env.DEBUG === 'true',
  entities,
  subscribers: [],
  migrations: [],
})
