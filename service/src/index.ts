import express from 'express'
import path from 'path'
import doreamon from '@zodash/doreamon'
import jwt from 'jsonwebtoken'
import type { ChatContext, ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { isNotEmptyString } from './utils/is'

import type { User } from './types'

import { db } from './database'

declare module 'express' {
  export interface Request {
    user: User
  }
}

const app = express()
const router = express.Router()

app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? 365 * 24 * 60 * 60 * 1000 : 0,
  index: false,
}))
app.use(express.json())

// @TODO jwt user
app.use(async (req, res, next) => {
  if (process.env.SECRET_KEY) {
    const token = req.get('x-connect-token')
    if (token !== '') {
      try {
        (req as any).$user = jwt.verify(token, process.env.SECRET_KEY)
      }
      catch (err) {
        console.error('jwt verify error:', err)

        throw new Error('Invalid JWT Token')
      }
    }
  }

  next()
})

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', auth, async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  doreamon.logger.info(`[${req.method} ${req.path}] ${req.get('user-agent')}`)

  const jwtUser: User = (req as any).$user

  const {
    prompt,
    options = {},
    user,
  } = req.body as {
    prompt: string
    options?: ChatContext
    user?: {
      nickname: string
    }
  }

  try {
    let firstChunk = true
    doreamon.logger.debug(`${user?.nickname}(jwt: ${jwtUser?.user_nickname}) ask ChatGPT: ${prompt}`)

    const message = await db.createMessage(prompt, options, jwtUser)

    await db.countUsage(jwtUser)

    const response = await chatReplyProcess(prompt, options, (chat: ChatMessage) => {
      // doreamon.logger.info(`ChatGPT answer ${user?.nickname}: ${prompt}`);
      res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
      firstChunk = false
    })

    // console.log(JSON.stringify(response, null, 2));

    if ((response?.data as any)?.text) {
      await db.saveMessage(
        message,
        (response.data as any).text,
        (response.data as any).detail?.model,
        (response.data as any).detail?.id,
      )
    }

    doreamon.logger.debug(`ChatGPT answer ${user?.nickname}(jwt: ${jwtUser?.user_nickname}): success for prompt => ${prompt}`)
  }
  catch (error) {
    doreamon.logger.error(`ChatGPT answer ${user?.nickname}(jwt: ${jwtUser?.user_nickname}): error for prompt => ${prompt}, error detail:`, error)
    // @TODO context_length_exceeded
    if (error.message.includes('context_length_exceeded')) {
      res.write('对话内容长度异常，请勿提问过快，通过 New Chat 创建新对话即可解决问题')
    }
    else {
      // unknown error
      res.write(JSON.stringify(error))
    }
  }
  finally {
    res.end()
  }
})

router.post('/config', async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

if (process.env.DB_HOST) {
  db
    .setup()
    .then(async () => {
      app.listen(3002, () => {
        globalThis.console.log('Server is running on port 3002')
      })
    })
    .catch(error => globalThis.console.log(error))
}
else {
  app.listen(3002, () => {
    globalThis.console.log('Server is running on port 3002')
  })
}
