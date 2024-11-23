'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/auth-context'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const DeviceSync: React.FC = () => {
  const { user, registerDevice, removeDevice, getDevices } = useAuth()
  const { toast } = useToast()
  const [devices, setDevices] = useState<{ deviceId: string; name: string; lastActive: Date }[]>([])
  const [showDeviceList, setShowDeviceList] = useState(false)

  useEffect(() => {
    const syncDevice = async () => {
      if (user) {
        try {
          const deviceId = generateDeviceId()
          const deviceName = navigator.userAgent
          await registerDevice(deviceId, deviceName)
          toast({
            title: "设备同步成功",
            description: "您的设备已成功注册并同步。",
          })
          updateDeviceList()
        } catch (error) {
          console.error('设备同步错误:', error)
          toast({
            title: "设备同步失败",
            description: "无法同步您的设备，请稍后重试。",
            variant: "destructive",
          })
        }
      }
    }

    syncDevice()
  }, [user, registerDevice, toast])

  const generateDeviceId = () => {
    return `${navigator.userAgent}-${window.innerWidth}x${window.innerHeight}-${Date.now()}`
  }

  const updateDeviceList = async () => {
    try {
      const deviceList = await getDevices()
      setDevices(deviceList)
    } catch (error) {
      console.error('获取设备列表错误:', error)
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await removeDevice(deviceId)
      toast({
        title: "设备移除成功",
        description: "该设备已从您的账户中移除。",
      })
      updateDeviceList()
    } catch (error) {
      console.error('设备移除错误:', error)
      toast({
        title: "设备移除失败",
        description: "无法移除设备，请稍后重试。",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button onClick={() => setShowDeviceList(true)}>管理设备</Button>
      <Dialog open={showDeviceList} onOpenChange={setShowDeviceList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>已同步的设备</DialogTitle>
            <DialogDescription>
              这里列出了您当前账户下的所有设备。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {devices.map((device) => (
              <div key={device.deviceId} className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-sm text-gray-500">最后活跃: {new Date(device.lastActive).toLocaleString()}</p>
                </div>
                <Button variant="destructive" onClick={() => handleRemoveDevice(device.deviceId)}>
                  移除
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDeviceList(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeviceSync

