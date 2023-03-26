import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Usage {
  @PrimaryGeneratedColumn()
  id: number

  @Column('integer', { default: 0 })
  count: number

  @Column('text', { nullable: true })
  user_id: string

  @Column('text', { nullable: true })
  user_nickname: string

  @Column('text', { nullable: true })
  user_email: string

  @Column('timestamp', { nullable: true })
  created_at: Date

  @Column('timestamp', { nullable: true })
  updated_at: Date
}
