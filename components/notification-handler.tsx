'use client'

import React, { useEffect, useState } from 'react'
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const NotificationHandler: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // 连接到WebSocket服务器
    const ws = new WebSocket('ws://your-websocket-server-url')

    ws.onopen = () => {
      console.log('WebSocket连接已建立')
    }

    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data)
      toast({
        title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      })
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket连接已关闭')
    }

    setSocket(ws)

    // 组件卸载时关闭WebSocket连接
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [toast])

  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

export default NotificationHandler

