import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: true })
  user_id: string

  @Column('text', { nullable: true })
  user_nickname: string

  @Column('text', { nullable: true })
  user_avatar: string

  @Column('text', { nullable: true })
  user_email: string

  @Column('text')
  prompt: string

  @Column('text', { nullable: true })
  answer: string

  @Column('timestamp', { nullable: true })
  created_at: Date

  @Column('timestamp', { nullable: true })
  updated_at: Date
}
