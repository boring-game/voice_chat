'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FriendRequestModalProps {
  onSendRequest: (friendId: string, message: string) => Promise<void>;
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({ onSendRequest }) => {
  const [friendId, setFriendId] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendRequest = async () => {
    if (!friendId.trim()) {
      setError('请输入好友ID')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await onSendRequest(friendId, message)
      setSuccess('好友请求已发送')
      setFriendId('')
      setMessage('')
    } catch (err) {
      setError('发送好友请求时出错')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">添加好友</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加好友</DialogTitle>
          <DialogDescription>
            输入好友ID和验证消息来发送好友请求。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="friend-id" className="text-right">
              好友ID
            </Label>
            <Input
              id="friend-id"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              placeholder="输入好友ID"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              验证消息
            </Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="我是..."
              className="col-span-3"
            />
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertTitle>成功</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button onClick={handleSendRequest} disabled={isSubmitting}>
            发送请求
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FriendRequestModal

