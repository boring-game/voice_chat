'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Moon, Sun } from 'lucide-react'

const SettingsPage = ({ onBack }: { onBack: () => void }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
        <Button variant="ghost" size="icon" className="mr-4" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">返回</span>
        </Button>
        <h1 className="text-xl font-semibold">设置</h1>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="audio" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="audio">音频</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="shortcuts">快捷键</TabsTrigger>
            <TabsTrigger value="profile">个人资料</TabsTrigger>
            <TabsTrigger value="appearance">外观</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-device">输入设备</Label>
              <Select>
                <SelectTrigger id="input-device">
                  <SelectValue placeholder="选择麦克风" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">默认麦克风</SelectItem>
                  <SelectItem value="headset">耳机麦克风</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-device">输出设备</Label>
              <Select>
                <SelectTrigger id="output-device">
                  <SelectValue placeholder="选择扬声器" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">默认扬声器</SelectItem>
                  <SelectItem value="headphones">耳机</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-notifications">允许通知</Label>
              <Switch id="allow-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-notifications">声音通知</Label>
              <Switch id="sound-notifications" />
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Label>切换静音</Label>
              <Input placeholder="Ctrl+M" />
              <Label>接听电话</Label>
              <Input placeholder="Ctrl+A" />
              <Label>结束通话</Label>
              <Input placeholder="Ctrl+E" />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" placeholder="您的用户名" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" type="email" placeholder="您的电子邮箱" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea id="bio" placeholder="介绍一下您自己" />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>主题</Label>
              <RadioGroup defaultValue={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">亮色</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">暗色</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="p-4 border-t border-gray-200 bg-white">
        <Button className="w-full">保存更改</Button>
      </footer>
    </div>
  )
}

export default SettingsPage

