'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Device {
  deviceId: string;
  name: string;
  lastActive: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  devices: Device[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  registerDevice: (deviceId: string, deviceName: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  getDevices: () => Promise<Device[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        throw new Error('登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        throw new Error('注册失败')
      }
    } catch (error) {
      console.error('注册错误:', error)
      throw error
    }
  }

  const registerDevice = async (deviceId: string, deviceName: string) => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch('/api/user/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, deviceName }),
      })

      if (response.ok) {
        const { devices } = await response.json()
        const updatedUser = { ...user, devices }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error('设备注册失败')
      }
    } catch (error) {
      console.error('设备注册错误:', error)
      throw error
    }
  }

  const removeDevice = async (deviceId: string) => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch(`/api/user/device/${deviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const { devices } = await response.json()
        const updatedUser = { ...user, devices }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error('设备移除失败')
      }
    } catch (error) {
      console.error('设备移除错误:', error)
      throw error
    }
  }

  const getDevices = async (): Promise<Device[]> => {
    if (!user) {
      throw new Error('用户未登录')
    }

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Device {
  deviceId: string;
  name: string;
  lastActive: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  devices: Device[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  registerDevice: (deviceId: string, deviceName: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  getDevices: () => Promise<Device[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        localStorage.setItem('user', JSON.stringify(userData.user))
        localStorage.setItem('token', userData.token)
      } else {
        throw new Error('登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        localStorage.setItem('user', JSON.stringify(userData.user))
        localStorage.setItem('token', userData.token)
      } else {
        throw new Error('注册失败')
      }
    } catch (error) {
      console.error('注册错误:', error)
      throw error
    }
  }

  const registerDevice = async (deviceId: string, deviceName: string) => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/register-device`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ deviceId, deviceName }),
      })

      if (response.ok) {
        const { devices } = await response.json()
        const updatedUser = { ...user, devices }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error('设备注册失败')
      }
    } catch (error) {
      console.error('设备注册错误:', error)
      throw error
    }
  }

  const removeDevice = async (deviceId: string) => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/device/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const { devices } = await response.json()
        const updatedUser = { ...user, devices }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error('设备移除失败')
      }
    } catch (error) {
      console.error('设备移除错误:', error)
      throw error
    }
  }

  const getDevices = async (): Promise<Device[]> => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/devices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('获取设备列表失败')
      }
    } catch (error) {
      console.error('获取设备列表错误:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, registerDevice, removeDevice, getDevices }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }
  return context
}