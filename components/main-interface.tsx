'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Mic, MicOff, Phone, LogOut, MessageSquare, Users, Search, Hash } from 'lucide-react'
import AddFriendGroupModal from './add-friend-group-modal'
import FriendRequestModal from './friend-request-modal'
import CallHistory from './call-history'
import ChatInterface from './chat-interface'
import GroupManagementModal from './group-management-modal'
import JoinGroupModal from './join-group-modal'

interface MainInterfaceProps {
  onStartCall: (name: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const MainInterface: React.FC<MainInterfaceProps> = ({ onStartCall, onLogout, onOpenSettings }) => {
  const [status, setStatus] = useState('online')
  const [isMuted, setIsMuted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChat, setActiveChat] = useState<{ id: string; type: 'friend' | 'group' } | null>(null)
  const [activeTab, setActiveTab] = useState('friends')
  const [friends, setFriends] = useState(['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Henry'])
  const [groups, setGroups] = useState(['游戏团队', '工作项目', '家庭', '学习小组', '兴趣社区'])
  const [onlineMembers, setOnlineMembers] = useState<string[]>([])

  const statusOptions = [
    { value: 'online', label: '在线', color: 'bg-green-500' },
    { value: 'away', label: '离开', color: 'bg-yellow-500' },
    { value: 'dnd', label: '请勿打扰', color: 'bg-red-500' },
    { value: 'invisible', label: '隐身', color: 'bg-gray-500' },
  ]

  useEffect(() => {
    setOnlineMembers(['Alice', 'Charlie', 'Eva'])
  }, [])

  const startChat = (name: string, type: 'friend' | 'group') => {
    setActiveChat({ id: name, type })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm bg-transparent border-none focus:ring-0"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <nav className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="search" 
                placeholder="搜索..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 p-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('friends')}>
              <Users className="h-5 w-5 mr-2" />
              好友
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('groups')}>
              <Hash className="h-5 w-5 mr-2" />
              群组
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('recent')}>
              <MessageSquare className="h-5 w-5 mr-2" />
              最近
            </Button>
          </div>
          <div className="p-2 space-y-2">
            <FriendRequestModal />
            <GroupManagementModal />
            <JoinGroupModal />
          </div>
        </nav>
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'friends' && (
            <FriendsList 
              friends={friends}
              onStartCall={onStartCall} 
              startChat={startChat} 
              searchQuery={searchQuery}
              onlineMembers={onlineMembers}
            />
          )}
          {activeTab === 'groups' && (
            <GroupsList
              groups={groups}
              onStartCall={onStartCall}
              startChat={startChat}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === 'recent' && <CallHistory />}
        </main>
      </div>
      {activeChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 overflow-hidden">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-200">{activeChat.id}</h2>
            <ChatInterface 
              participants={[
                { id: 'currentUser', name: 'You', avatar: '/placeholder-avatar.jpg' },
                ...(activeChat.type === 'friend' 
                  ? [{ id: activeChat.id, name: activeChat.id, avatar: '/placeholder-avatar.jpg' }]
                  : [])
              ]} 
              currentUserId="currentUser"
              groupId={activeChat.type === 'group' ? activeChat.id : undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface ListProps {
  onStartCall: (name: string) => void;
  startChat: (name: string, type: 'friend' | 'group') => void;
  searchQuery: string;
}

interface FriendsListProps extends ListProps {
  friends: string[];
  onlineMembers: string[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onStartCall, startChat, searchQuery, onlineMembers }) => {
  const filteredFriends = friends.filter(friend => 
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ul className="space-y-2">
      {filteredFriends.map((friend) => (
        <li key={friend} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{friend[0]}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{friend}</span>
              {onlineMembers.includes(friend) && (
                <Badge variant="success" className="ml-2">在线</Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => startChat(friend, 'friend')}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onStartCall(friend)}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

interface GroupsListProps extends ListProps {
  groups: string[];
}

const GroupsList: React.FC<GroupsListProps> = ({ groups, onStartCall, startChat, searchQuery }) => {
  const filteredGroups = groups.filter(group => 
    group.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ul className="space-y-2">
      {filteredGroups.map((group) => (
        <li key={group} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{group[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{group}</span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => startChat(group, 'group')}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onStartCall(group)}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default MainInterface

