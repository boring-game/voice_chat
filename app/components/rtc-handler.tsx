'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { AudioQualityService } from '../services/audio-quality-service'

interface RTCHandlerProps {
  roomId: string;
  userId: string;
  onEndCall: () => void;
  participants: string[];
  isGroupCall: boolean;
}

const RTCHandler: React.FC<RTCHandlerProps> = ({ roomId, userId, onEndCall, participants, isGroupCall }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudiosRef = useRef<{ [key: string]: HTMLAudioElement }>({})
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({})
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenShareStreamRef = useRef<MediaStream | null>(null)
  const audioQualityService = useRef(new AudioQualityService())

  const createPeerConnection = useCallback((participantId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the signaling server
        console.log('New ICE candidate:', event.candidate)
      }
    }

    peerConnection.oniceconnectionstatechange = () => {
      switch(peerConnection.iceConnectionState) {
        case "failed":
        case "disconnected":
        case "closed":
          toast({
            title: "连接中断",
            description: "与参与者的连接已断开。正在尝试重新连接...",
            variant: "destructive",
          });
          // Attempt to reconnect
          createPeerConnection(participantId);
          break;
      }
    }

    peerConnection.ontrack = (event) => {
      if (!remoteAudiosRef.current[participantId]) {
        const audio = new Audio()
        audio.srcObject = event.streams[0]
        remoteAudiosRef.current[participantId] = audio
        audio.play()
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!)
      })
    }

    peerConnectionsRef.current[participantId] = peerConnection

    return peerConnection
  }, [])

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream
        }

        participants.forEach(participantId => {
          if (participantId !== userId) {
            createPeerConnection(participantId)
          }
        })

        setIsConnected(true)
      } catch (error) {
        console.error('Error initializing call:', error)
        toast({
          title: "通话初始化失败",
          description: "无法访问麦克风。请检查您的设备设置。",
          variant: "destructive",
        });
      }
    }

    initializeCall()

    return () => {
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [roomId, userId, participants, createPeerConnection])

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }, [])

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      screenShareStreamRef.current = stream
      
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(stream.getVideoTracks()[0])
        } else {
          pc.addTrack(stream.getVideoTracks()[0], stream)
        }
      })
      
      setIsScreenSharing(true)
    } catch (err) {
      console.error("Error starting screen share:", err)
      toast({
        title: "屏幕共享失败",
        description: "无法启动屏幕共享。请检查您的浏览器设置。",
        variant: "destructive",
      });
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop())
      screenShareStreamRef.current = null
    }
    setIsScreenSharing(false)

    Object.values(peerConnectionsRef.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video')
      if (sender) {
        sender.replaceTrack(null)
      }
    })
  }, [])

  const adjustAudioQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioQualityService.current.adjustAudioQuality(audioTrack, quality)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <audio ref={localAudioRef} autoPlay muted />
      {Object.entries(remoteAudiosRef.current).map(([participantId, audio]) => (
        <audio key={participantId} ref={(el) => { if (el) el.srcObject = audio.srcObject }} autoPlay />
      ))}
      <div className="flex space-x-4">
        <Button onClick={toggleMute} variant={isMuted ? "destructive" : "default"}>
          {isMuted ? '取消静音' : '静音'}
        </Button>
        {isGroupCall && (
          <Button onClick={isScreenSharing ? stopScreenShare : startScreenShare} variant="outline">
            {isScreenSharing ? '停止共享屏幕' : '共享屏幕'}
          </Button>
        )}
        <Button onClick={() => adjustAudioQuality('high')} variant="outline">
          高质量音频
        </Button>
        <Button onClick={onEndCall} variant="destructive">
          结束通话
        </Button>
      </div>
      <p>{isConnected ? '已连接' : '正在连接...'}</p>
    </div>
  )
}

export default RTCHandler

