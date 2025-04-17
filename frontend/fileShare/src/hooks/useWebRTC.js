// hooks/useWebRTC.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const CHUNK_SIZE = 16384;

export default function useWebRTC(roomId, isInitiator, onFileReceived, onConnectionStatusChange) {
  const [socket, setSocket] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const fileReader = useRef(new FileReader());

  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);

  const receivedChunks = useRef([]);
  const receivedFileSize = useRef(0);
  const currentMetadata = useRef({});

  // Add a useEffect to monitor the connected state
  useEffect(() => {
    console.log('Connected state changed:', connected);
    onConnectionStatusChange(connected ? 'Connected' : 'Not Connected');
  }, [connected, onConnectionStatusChange]);

  useEffect(() => {
    if (!roomId) return;

    const socket = io('http://localhost:3000');
    setSocket(socket);

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    // Handle ICE connection state changes
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnectionRef.current.iceConnectionState);
      if (peerConnectionRef.current.iceConnectionState === 'connected') {
        console.log('ICE connection established');
      } else if (peerConnectionRef.current.iceConnectionState === 'failed') {
        console.error('ICE connection failed');
        setConnected(false);
      }
    };

    // Handle connection state changes
    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnectionRef.current.connectionState);
      if (peerConnectionRef.current.connectionState === 'connected') {
        setConnected(true);
      } else if (peerConnectionRef.current.connectionState === 'failed' || 
                 peerConnectionRef.current.connectionState === 'disconnected') {
        setConnected(false);
      }
    };

    // Handle DataChannel
    if (isInitiator) {
      console.log('Creating data channel as initiator');
      const dataChannel = peerConnectionRef.current.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 0
      });
      dataChannelRef.current = dataChannel;
      setupDataChannel(dataChannel);
    } else {
      console.log('Setting up data channel handler as receiver');
      peerConnectionRef.current.ondatachannel = (event) => {
        console.log('Data channel received from initiator');
        dataChannelRef.current = event.channel;
        setupDataChannel(event.channel);
      };
    }

    // Socket listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      if (isInitiator) {
        console.log('Creating room:', roomId);
        socket.emit('create_room', { roomId });
      } else {
        console.log('Joining room:', roomId);
        socket.emit('join_room', { roomId });
      }
    });

    socket.on('room_created', async () => {
      console.log('Room created, waiting for peer...');
      onConnectionStatusChange('Waiting for peer...');
    });

    socket.on('peer_joined', async () => {
      console.log('Peer joined the room');
      if (isInitiator) {
        console.log('Creating offer as initiator');
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      }
    });

    socket.on('offer', async ({ offer }) => {
      console.log('Received offer, creating answer');
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async ({ answer }) => {
      console.log('Received answer, setting remote description');
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('Received ICE candidate');
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding received ICE candidate', error);
      }
    });

    return () => {
      socket.disconnect();
      peerConnectionRef.current.close();
      setConnected(false);
    };
  }, [roomId, isInitiator]);

  const setupDataChannel = (channel) => {
    console.log('Setting up data channel');
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log('Data channel opened');
      setConnected(true);
      onConnectionStatusChange('Connected');
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      setConnected(false);
      onConnectionStatusChange('Disconnected');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnected(false);
      onConnectionStatusChange('Connection error');
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const metadata = JSON.parse(event.data);
        if (metadata.type === 'file') {
          currentMetadata.current = metadata;
          receivedChunks.current = [];
          receivedFileSize.current = 0;
          setProgress(0);
        } else if (metadata.type === 'transfer_complete') {
          const blob = new Blob(receivedChunks.current, { type: currentMetadata.current.fileType });
          const file = {
            name: currentMetadata.current.name,
            blob: blob,
            size: currentMetadata.current.size,
            type: currentMetadata.current.fileType,
            url: URL.createObjectURL(blob) // Add URL for downloading
          };
          onFileReceived(file);
          receivedChunks.current = [];
          receivedFileSize.current = 0;
          setProgress(0);

          // Send confirmation back to sender
          if (!isInitiator) {
            channel.send(JSON.stringify({ type: 'transfer_complete' }));
          }
        }
      } else {
        receivedChunks.current.push(event.data);
        receivedFileSize.current += event.data.byteLength;
        const progress = Math.min((receivedFileSize.current / currentMetadata.current.size) * 100, 100);
        setProgress(progress);
      }
    };
  };

  const sendFile = (file, onTransferComplete) => {
    console.log('Attempting to send file, connected state:', connected);
    console.log('Data channel state:', dataChannelRef.current ? dataChannelRef.current.readyState : 'no channel');
    
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel not ready. State:', dataChannelRef.current ? dataChannelRef.current.readyState : 'no channel');
      return;
    }

    dataChannelRef.current.send(JSON.stringify({
      type: 'file',
      name: file.name,
      size: file.size,
      fileType: file.type
    }));

    let offset = 0;

    const sliceAndSend = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);

      fileReader.current.onload = () => {
        if (dataChannelRef.current.readyState === 'open') {
          dataChannelRef.current.send(fileReader.current.result);
          offset += CHUNK_SIZE;
          const progress = Math.min((offset / file.size) * 100, 100);
          setProgress(progress);

          if (offset < file.size) {
            sliceAndSend();
          } else {
            dataChannelRef.current.send(JSON.stringify({ type: 'transfer_complete' }));
            if (onTransferComplete) {
              onTransferComplete();
            }
          }
        }
      };

      fileReader.current.readAsArrayBuffer(slice);
    };

    sliceAndSend();
  };

  return {
    connected,
    sendFile,
    progress
  };
}
