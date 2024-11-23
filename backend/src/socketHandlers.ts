import { Server, Socket } from 'socket.io';
import Message from './models/Message';
import User from './models/User';
import Group from './models/Group';

interface EncryptedMessage {
  type: 'message' | 'file';
  content?: string;
  url?: string;
  name?: string;
  size?: number;
}

export const setupSocketHandlers = (io: Server) => {
  const userSockets = new Map<string, Set<string>>();
  const userPublicKeys = new Map<string, JsonWebKey>();
  const rooms = new Map<string, Set<string>>();

  const addUserSocket = (userId: string, socketId: string) => {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socketId);
  };

  const removeUserSocket = (userId: string, socketId: string) => {
    const userSocketSet = userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        userSockets.delete(userId);
        userPublicKeys.delete(userId);
      }
    }
  };

  const getUserSockets = (userId: string): Set<string> | undefined => {
    return userSockets.get(userId);
  };

  io.on('connection', (socket: Socket) => {
    console.log('新客户端连接');

    socket.on('authenticate', async (data: { userId: string, deviceId: string }) => {
      const { userId, deviceId } = data;
      addUserSocket(userId, socket.id);
      
      await User.findByIdAndUpdate(userId, { 
        status: 'online',
        $set: { 'devices.$[elem].lastActive': new Date() }
      }, {
        arrayFilters: [{ 'elem.deviceId': deviceId }]
      });

      io.emit('user_status_change', { userId, status: 'online' });

      // 获取并发送未送达的消息
      const undeliveredMessages = await Message.find({ 
        $or: [
          { receiver: userId, isDelivered: false, isRevoked: false },
          { group: { $in: await Group.find({ members: userId }).distinct('_id') }, isRevoked: false }
        ]
      });
      for (const message of undeliveredMessages) {
        socket.emit('new-message', {
          id: message._id,
          type: 'message',
          content: message.content,
          sender: message.sender,
          receiver: message.receiver,
          group: message.group,
          timestamp: message.timestamp,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize
        });
        if (message.receiver && message.receiver.toString() === userId) {
          message.isDelivered = true;
          await message.save();
        }
      }
    });

    socket.on('publicKey', (data: { userId: string, key: JsonWebKey }) => {
      userPublicKeys.set(data.userId, data.key);
    });

    socket.on('send-message', async (data: EncryptedMessage & { receiverId?: string, groupId?: string, senderId: string }) => {
      const message = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        group: data.groupId,
        content: data.content,
        fileUrl: data.url,
        fileName: data.name,
        fileSize: data.size,
      });
      await message.save();

      if (data.groupId) {
        const group = await Group.findById(data.groupId);
        if (group) {
          group.members.forEach(memberId => {
            const memberSockets = getUserSockets(memberId.toString());
            if (memberSockets) {
              memberSockets.forEach(socketId => {
                if (socketId !== socket.id) {
                  io.to(socketId).emit('new-message', { ...data, id: message._id, group: data.groupId });
                }
              });
            }
          });
        }
      } else if (data.receiverId) {
        const receiverSockets = getUserSockets(data.receiverId);
        if (receiverSockets) {
          receiverSockets.forEach(socketId => {
            io.to(socketId).emit('new-message', { ...data, id: message._id });
          });
          message.isDelivered = true;
          await message.save();
        }
      }

      // 同步消息到发送者的其他设备
      const senderSockets = getUserSockets(data.senderId);
      if (senderSockets) {
        senderSockets.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('sync-message', { ...data, id: message._id, group: data.groupId });
          }
        });
      }
    });

    socket.on('revoke-message', async (data: { messageId: string, senderId: string }) => {
      const message = await Message.findById(data.messageId);
      if (message && message.sender.toString() === data.senderId) {
        message.isRevoked = true;
        await message.save();

        if (message.group) {
          const group = await Group.findById(message.group);
          if (group) {
            group.members.forEach(memberId => {
              const memberSockets = getUserSockets(memberId.toString());
              if (memberSockets) {
                memberSockets.forEach(socketId => {
                  io.to(socketId).emit('message-revoked', { messageId: message._id, groupId: message.group });
                });
              }
            });
          }
        } else if (message.receiver) {
          const receiverSockets = getUserSockets(message.receiver.toString());
          if (receiverSockets) {
            receiverSockets.forEach(socketId => {
              io.to(socketId).emit('message-revoked', { messageId: message._id });
            });
          }
        }

        // 同步撤回消息到发送者的其他设备
        const senderSockets = getUserSockets(data.senderId);
        if (senderSockets) {
          senderSockets.forEach(socketId => {
            if (socketId !== socket.id) {
              io.to(socketId).emit('message-revoked', { messageId: message._id, groupId: message.group });
            }
          });
        }
      }
    });

    socket.on('message-read', async (messageId: string) => {
      const message = await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
      if (message) {
        const senderSockets = getUserSockets(message.sender.toString());
        if (senderSockets) {
          senderSockets.forEach(socketId => {
            io.to(socketId).emit('message-read', { messageId: message._id, groupId: message.group });
          });
        }
      }
    });

    socket.on('join-room', (roomId: string, userId: string) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)!.add(userId);
      socket.to(roomId).emit('user-joined', userId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId: string, userId: string) => {
      socket.leave(roomId);
      rooms.get(roomId)?.delete(userId);
      if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId);
      }
      socket.to(roomId).emit('user-left', userId);
      console.log(`User ${userId} left room: ${roomId}`);
    });

    socket.on('start-call', (data: { callerId: string; roomId: string }) => {
      socket.to(data.roomId).emit('incoming-call', data);
    });

    socket.on('accept-call', (data: { callerId: string; roomId: string }) => {
      socket.to(data.roomId).emit('call-accepted', data);
    });

    socket.on('ice-candidate', (data: { roomId: string; candidate: RTCIceCandidate; userId: string }) => {
      socket.to(data.roomId).emit('ice-candidate', { candidate: data.candidate, userId: data.userId });
    });

    socket.on('offer', (data: { roomId: string; offer: RTCSessionDescriptionInit; userId: string }) => {
      socket.to(data.roomId).emit('offer', { offer: data.offer, userId: data.userId });
    });

    socket.on('answer', (data: { roomId: string; answer: RTCSessionDescriptionInit; userId: string }) => {
      socket.to(data.roomId).emit('answer', { answer: data.answer, userId: data.userId });
    });

    socket.on('disconnect', async () => {
      console.log('客户端断开连接');
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          removeUserSocket(userId, socket.id);
          if (!getUserSockets(userId)) {
            await User.findByIdAndUpdate(userId, { status: 'offline' });
            io.emit('user_status_change', { userId, status: 'offline' });
          }
          break;
        }
      }
    });
  });
};

