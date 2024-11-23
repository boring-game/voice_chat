'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react'

interface CallRecord {
  id: string;
  contactName: string;
  contactAvatar: string;
  timestamp: string;
  duration: string;
  type: 'incoming' | 'outgoing' | 'missed';
}

const CallHistory: React.FC = () => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([])

  useEffect(() => {
    // 这里应该从API获取通话记录
    const fetchCallHistory = async () => {
      try {
        const response = await fetch('/api/call-history')
        if (response.ok) {
          const data = await response.json()
          setCallRecords(data)
        } else {
          console.error('Failed to fetch call history')
        }
      } catch (error) {
        console.error('Error fetching call history:', error)
      }
    }

    fetchCallHistory()
  }, [])

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-green-500" />
      case 'outgoing':
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-500" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <h2 className="text-2xl font-bold mb-4">通话历史</h2>
      <ul className="space-y-4">
        {callRecords.map((record) => (
          <li key={record.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={record.contactAvatar} alt={record.contactName} />
                <AvatarFallback>{record.contactName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{record.contactName}</p>
                <p className="text-sm text-muted-foreground">{record.timestamp}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getCallIcon(record.type)}
              <span className="text-sm">{record.duration}</span>
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call {record.contactName}</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

export default CallHistory

