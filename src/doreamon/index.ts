import type { App } from 'vue'
import doreamon from '@zodash/doreamon'
import { useUserStore } from '@/store'

export async function setupDoreamon(_app: App) {
  doreamon.mount.toWindow()

  // setup on page show => user login
  doreamon.dom.page.onPageShow(checkUser)

  // page heart beat: 5min
  pageHeartBeat(5 * 60 * 1000)

  // setup user
  const userStore = useUserStore()
  await userStore.setupUserInfo()
}

function pageHeartBeat(interval: number) {
  return setTimeout(async () => {
    doreamon.logger.info('page heart beat')

    try {
      await checkUser()

      pageHeartBeat(interval)
    }
    catch (error) {
      console.error('failed to page heart beat:', error)
    }
  }, interval)
}

export async function getUser() {
  const response = await fetch('/api/user')
  if (response.status === 401)
    return await handleStatusUnauthorized()

  const data = await response.json()
  const user = data?.result

  if (user)
    (window as any).$user = user

  return user
}

export async function checkUser() {
  try {
    if ((window as any).isCheckingUser)
      return

    (window as any).isCheckingUser = true

    doreamon.logger.info('checking user ...')

    const response = await fetch('/api/user')
    if (response.status === 401)
      return await handleStatusUnauthorized()
  }
  finally {
    (window as any).isCheckingUser = false
  }
}

export function isStatusUnauthorizedHandling() {
  return (window as any).isStatusUnauthorizedHandling
}

export async function handleStatusUnauthorized(): Promise<any> {
  if ((window as any).isStatusUnauthorizedHandling)
    return
  (window as any).isStatusUnauthorizedHandling = true

  const rootSelector = document.querySelector('#app')

  rootSelector!.innerHTML = `
<style>
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.balls {
  width: 4em;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
}

.balls div {
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  background-color: #1e76f0;
}

.balls div:nth-of-type(1) {
  transform: translateX(-100%);
  animation: left-swing 0.5s ease-in alternate infinite;
}

.balls div:nth-of-type(3) {
  transform: translateX(-95%);
  animation: right-swing 0.5s ease-out alternate infinite;
}

@keyframes left-swing {

  50%,
  100% {
    transform: translateX(95%);
  }
}

@keyframes right-swing {
  50% {
    transform: translateX(-95%);
  }

  100% {
    transform: translateX(100%);
  }
}

@media (prefers-color-scheme: dark) {
  body {
    background: #121212;
  }
}
</style>
<div class="loading-wrap">
<div class="balls">
  <div></div>
  <div></div>
  <div></div>
</div>
</div>`

  await doreamon.delay(300)

  window.location.reload()
}
