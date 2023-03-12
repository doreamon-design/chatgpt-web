import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'
import * as doreamon from '../../doreamon';

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})

service.interceptors.request.use(
  (config) => {
    if (doreamon.isStatusUnauthorizedHandling()) {
      throw new Error(`Handling status unauthorized => reject all requests`);
    }

    const token = useAuthStore().token
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  async (response: AxiosResponse): Promise<AxiosResponse> => {
    if (response.status === 401) {
      await doreamon.handleStatusUnauthorized();
      throw new Error(response.status.toString())
    }

    if (response.status === 200)
      return Promise.resolve(response)

    throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
