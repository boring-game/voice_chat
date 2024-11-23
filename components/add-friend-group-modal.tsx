import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AddFriendGroupModal = () => {
  const [addType, setAddType] = useState<'friend' | 'group'>('friend')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreateGroup = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      // 这里应该调用实际的API
      const response = await fetch('/api/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, description: groupDescription }),
      })
      if (response.ok) {
        setSuccess('群组创建成功')
        setGroupName('')
        setGroupDescription('')
      } else {
        const data = await response.json()
        setError(data.message || '创建群组失败')
      }
    } catch (err) {
      setError('创建群组时出错')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">添加好友/群组</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加好友或创建群组</DialogTitle>
          <DialogDescription>
            在这里添加新的好友或创建一个新的群组。
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="friend" onValueChange={(value) => setAddType(value as 'friend' | 'group')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friend">添加好友</TabsTrigger>
            <TabsTrigger value="group">创建群组</TabsTrigger>
          </TabsList>
          <TabsContent value="friend">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="friend-id" className="text-right">
                  好友ID
                </Label>
                <Input id="friend-id" placeholder="输入好友ID" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="friend-message" className="text-right">
                  验证消息
                </Label>
                <Input id="friend-message" placeholder="我是..." className="col-span-3" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="group">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  群组名称
                </Label>
                <Input 
                  id="group-name" 
                  placeholder="输入群组名称" 
                  className="col-span-3"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-description" className="text-right">
                  群组描述
                </Label>
                <Input 
                  id="group-description" 
                  placeholder="描述这个群组..." 
                  className="col-span-3"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateGroup} disabled={isSubmitting}>
            {addType === 'friend' ? '发送好友请求' : '创建群组'}
          </Button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {success && <p className="text-green-500 text-xs mt-2">{success}</p>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendGroupModal

