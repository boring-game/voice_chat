'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { uploadFile, downloadFile } from '../services/fileTransferService';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

interface FileTransferModalProps {
  onSendFile: (file: File | string) => Promise<void>;
}

const FileTransferModal: React.FC<FileTransferModalProps> = ({ onSendFile }) => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('文件大小不能超过100MB');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  }

  const handleSendFile = async () => {
    if (!file) {
      setError('请选择要发送的文件');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('文件大小不能超过100MB');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const fileUrl = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      await onSendFile(fileUrl, file);
      setSuccess('文件发送成功');
      setFile(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('文件发送失败，请重试');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      await downloadFile(fileUrl, fileName)
      setSuccess('文件下载成功')
    } catch (err) {
      setError('文件下载失败，请重试')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">发送文件</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>发送文件</DialogTitle>
          <DialogDescription>
            选择要发送的文件并点击发送按钮。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              文件
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {isUploading && (
            <div className="col-span-4">
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
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
          <Button onClick={handleSendFile} disabled={isUploading || !file}>
            {isUploading ? '发送中...' : '发送'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileTransferModal

