'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from '../contexts/auth-context'

interface Group {
  _id: string;
  name: string;
  description: string;
}

const GroupManagementModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'leave'>('create')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupId, setGroupId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const { user } = useAuth()

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    try {
      const response = await fetch('/api/group/user-groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const groups = await response.json()
        setUserGroups(groups)
      } else {
        console.error('Failed to fetch user groups')
      }
    } catch (error) {
      console.error('Error fetching user groups:', error)
    }
  }

  const handleAction = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      let response
      switch (activeTab) {
        case 'create':
          if (!groupName.trim() || !groupDescription.trim()) {
            setError('请填写所有必填字段')
            return
          }
          response = await fetch('/api/group/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: groupName, description: groupDescription }),
          })
          if (response.ok) {
            setSuccess('群组创建成功')
            setGroupName('')
            setGroupDescription('')
            fetchUserGroups()
          } else {
            setError('创建群组失败')
          }
          break
        case 'join':
          if (!groupId.trim()) {
            setError('请输入群组ID')
            return
          }
          response = await fetch(`/api/group/join/${groupId}`, {
            method: 
'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          if (response.ok) {
            setSuccess('成功加入群组')
            setGroupId('')
            fetchUserGroups()
          } else {
            setError('加入群组失败')
          }
          break
        case 'leave':
          if (!groupId.trim()) {
            setError('请选择要离开的群组')
            return
          }
          response = await fetch(`/api/group/leave/${groupId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          if (response.ok) {
            setSuccess('已成功离开群组')
            setGroupId('')
            fetchUserGroups()
          } else {
            setError('离开群组失败')
          }
          break
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">群组管理</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>群组管理</DialogTitle>
          <DialogDescription>
            创建新群组、加入现有群组或离开群组。
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'join' | 'leave')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">创建群组</TabsTrigger>
            <TabsTrigger value="join">加入群组</TabsTrigger>
            <TabsTrigger value="leave">离开群组</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  群组名称
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="输入群组名称"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-description" className="text-right">
                  群组描述
                </Label>
                <Input
                  id="group-description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="描述这个群组..."
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="join">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-id" className="text-right">
                  群组ID
                </Label>
                <Input
                  id="group-id"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="输入群组ID"
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="leave">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leave-group" className="text-right">
                  选择群组
                </Label>
                <select
                  id="leave-group"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="col-span-3"
                >
                  <option value="">选择要离开的群组</option>
                  {userGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
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
        <DialogFooter>
          <Button onClick={handleAction} disabled={isSubmitting}>
            {activeTab === 'create' ? '创建群组' : activeTab === 'join' ? '加入群组' : '离开群组'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GroupManagementModal

