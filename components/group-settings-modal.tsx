'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '../contexts/auth-context'
import { Copy } from 'lucide-react'

interface GroupMember {
  _id: string;
  username: string;
  avatar: string;
}

interface GroupSettingsModalProps {
  groupId: string;
  groupName: string;
  groupDescription: string;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ groupId, groupName, groupDescription }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'invite'>('settings')
  const [name, setName] = useState(groupName)
  const [description, setDescription] = useState(groupDescription)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [newMemberId, setNewMemberId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchGroupMembers()
  }, [])

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch(`/api/group/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const members = await response.json()
        setMembers(members)
      } else {
        console.error('Failed to fetch group members')
      }
    } catch (error) {
      console.error('Error fetching group members:', error)
    }
  }

  const handleUpdateSettings = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        setSuccess('群组设置更新成功')
      } else {
        setError('更新群组设置失败')
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMember = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/group/${groupId}/add-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: newMemberId }),
      })

      if (response.ok) {
        setSuccess('成员添加成功')
        setNewMemberId('')
        fetchGroupMembers()
      } else {
        setError('添加成员失败')
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/group/${groupId}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: memberId }),
      })

      if (response.ok) {
        setSuccess('成员移除成功')
        fetchGroupMembers()
      } else {
        setError('移除成员失败')
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateInvite = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/group/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        setSuccess('邀请链接生成成功')
      } else {
        setError('生成邀请链接失败')
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setSuccess('邀请码已复制到剪贴板')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">群组设置</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>群组设置</DialogTitle>
          <DialogDescription>
            管理群组设置、成员和邀请。
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'settings' | 'members' | 'invite')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">设置</TabsTrigger>
            <TabsTrigger value="members">成员</TabsTrigger>
            <TabsTrigger value="invite">邀请</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  群组名称
                </Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-description" className="text-right">
                  群组描述
                </Label>
                <Input
                  id="group-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleUpdateSettings} disabled={isSubmitting}>
              更新设置
            </Button>
          </TabsContent>
          <TabsContent value="members">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-member-id" className="text-right">
                  添加成员
                </Label>
                <Input
                  id="new-member-id"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  placeholder="输入用户ID"
                  className="col-span-2"
                />
                <Button onClick={handleAddMember} disabled={isSubmitting}>
                  添加
                </Button>
              </div>
              <div className="mt-4">
                <h3 className="mb-2 font-semibold">群组成员</h3>
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.username[0]}</AvatarFallback>
                      </Avatar>
                      <span>{member.username}</span>
                    </div>
                    {user?.id !== member._id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isSubmitting}
                      >
                        移除
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="invite">
            <div className="grid gap-4 py-4">
              <Button onClick={handleGenerateInvite} disabled={isSubmitting}>
                生成邀请链接
              </Button>
              {inviteCode && (
                <div className="flex items-center justify-between">
                  <Input value={inviteCode} readOnly />
                  <Button variant="outline" size="icon" onClick={copyInviteCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
      </DialogContent>
    </Dialog>
  )
}

export default GroupSettingsModal

