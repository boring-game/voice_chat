'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MoreVertical, Trash2, Send } from 'lucide-react'
import FileTransferModal from './file-transfer-modal'
import GroupSettingsModal from './group-settings-modal'
import { CryptoService } from '../services/cryptoService'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/auth-context'

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  encrypted?: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

interface ChatInterfaceProps {
  participants: { id: string; name: string; avatar: string }[];
  currentUserId: string;
  groupId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ participants, currentUserId, groupId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const cryptoService = CryptoService.getInstance()
  const { toast } = useToast()
  const { user } = useAuth()
  const [groupInfo, setGroupInfo] = useState<{ name: string; description: string } | null>(null)

  useEffect(() => {
    // Simulating message fetch
    setMessages([
      {
        id: '1',
        sender: 'Alice',
        content: '你好！最近怎么样？',
        timestamp: new Date(Date.now() - 100000),
      },
      {
        id: '2',
        sender: currentUserId,
        content: '嗨Alice！我很好，谢谢。你呢？',
        timestamp: new Date(Date.now() - 80000),
      },
      {
        id: '3',
        sender: 'Alice',
        content: '我也不错。我们来讨论一下新项目吧。',
        timestamp: new Date(Date.now() - 60000),
      },
    ])
  }, [currentUserId])

  useEffect(() => {
    if (groupId) {
      // Simulating group info fetch
      setGroupInfo({
        name: '项目讨论组',
        description: '讨论新项目的群组'
      })
    }
  }, [groupId])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: currentUserId,
        content: newMessage,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {groupId && groupInfo && (
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{groupInfo.name}</h2>
            <p className="text-sm text-gray-500">{groupInfo.description}</p>
          </div>
          <GroupSettingsModal
            groupId={groupId}
            groupName={groupInfo.name}
            groupDescription={groupInfo.description}
          />
        </div>
      )}
      
<ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex ${message.sender === currentUserId ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%]`}>
              <Avatar className="w-8 h-8 mx-2">
                <AvatarImage src={participants.find(p => p.id === message.sender)?.avatar} />
                <AvatarFallback>{participants.find(p => p.id === message.sender)?.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`rounded-lg p-3 ${message.sender === currentUserId ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}>
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-grow"
          />
          <FileTransferModal onSendFile={() => {}} />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

