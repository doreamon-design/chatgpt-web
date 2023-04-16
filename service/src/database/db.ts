import type { Conversation, User } from '../types'
import { Usage } from './entity/usage'
import { AppDataSource } from './data-source'
import { Message } from './entity/message'

export class Database {
  public async setup() {
    return AppDataSource.initialize()
  }

  public async countUsage(user?: User) {
    if (!user?.user_id)
      return

    let usage = await AppDataSource.manager.findOne(Usage, {
      where: {
        user_id: user.user_id,
      },
    })
    if (!usage) {
      usage = AppDataSource.manager.create(Usage, {
        count: 0,
        user_id: user.user_id,
        user_nickname: user.user_nickname,
        user_email: user.user_email,
        created_at: new Date(),
      })
    }

    if (!usage.user_nickname)
      usage.user_nickname = user.user_nickname

    usage.count += 1
    usage.updated_at = new Date()
    await AppDataSource.manager.save(usage)
  }

  public async createMessage(prompt: string, conversation?: Conversation, user?: User): Promise<Message> {
    const message = new Message()
    if (conversation) {
      message.conversation_id = conversation.conversationId || ''
      message.conversation_name = conversation.conversationName || ''
      message.parent_message_id = conversation.parentMessageId || ''
    }
    if (user) {
      message.user_id = user.user_id
      message.user_nickname = user.user_nickname
      message.user_avatar = user.user_avatar
      message.user_email = user.user_email
    }
    message.prompt = prompt
    message.created_at = new Date()

    return await AppDataSource.manager.save(message)
  }

  public async saveMessage(message: Message, answer: string, model: string, answer_id: string): Promise<Message> {
    message.answer = answer
    message.model = model
    message.answer_id = answer_id
    message.updated_at = new Date()

    return await AppDataSource.manager.save(message)
  }
}
