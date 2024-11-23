import axios from 'axios';

export const uploadFile = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data.fileUrl;
  } catch (error) {
    console.error('文件上传错误:', error);
    throw new Error('文件上传失败');
  }
};

export const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('文件下载错误:', error);
    throw new Error('文件下载失败');
  }
};

