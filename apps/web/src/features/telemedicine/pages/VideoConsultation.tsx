import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { useGetSessionByIdQuery, useUpdateSessionStatusMutation } from '../api/telemedicineApi';
import { TeleconsultationStatus } from '@medicalink/shared';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp, Activity } from 'lucide-react';

export const VideoConsultation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetSessionByIdQuery(id as string, { skip: !id });
  const [updateStatus] = useUpdateSessionStatusMutation();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const isDoctor = window.location.pathname.includes('/app/telemedicine');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    if (id) {
      socketRef.current.emit('join-telemed-room', id);
    }

    if (isDoctor) {
      // Doctor tells patient they are ready
      socketRef.current.emit('doctor-ready', { roomId: id });
    }

    socketRef.current.on('webrtc-offer', (offer) => {
      setReceivingCall(true);
      setCallerSignal(offer);
    });

    socketRef.current.on('webrtc-answer', (answer) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(answer);
      }
    });

    socketRef.current.on('webrtc-ice-candidate', (candidate) => {
      if (connectionRef.current) {
        connectionRef.current.signal(candidate);
      }
    });

    socketRef.current.on('call-ended', () => {
      handleCallEnded();
    });

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const callUser = () => {
    if (!stream) return;
    
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream: stream,
    });

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        socketRef.current?.emit('webrtc-offer', { roomId: id, offer: data });
      } else {
        socketRef.current?.emit('webrtc-ice-candidate', { roomId: id, candidate: data });
      }
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;

    if (id) {
      updateStatus({ id, status: TeleconsultationStatus.ACTIVE });
    }
  };

  const answerCall = () => {
    if (!stream) return;
    
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream: stream,
    });

    peer.on('signal', (data) => {
      if (data.type === 'answer') {
        socketRef.current?.emit('webrtc-answer', { roomId: id, answer: data });
      } else {
        socketRef.current?.emit('webrtc-ice-candidate', { roomId: id, candidate: data });
      }
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const handleCallEnded = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (id && isDoctor) {
      updateStatus({ id, status: TeleconsultationStatus.COMPLETED });
      navigate(`/app/telemedicine/session/${id}/notes`);
    } else {
      navigate('/portal/dashboard');
    }
  };

  const leaveCall = () => {
    socketRef.current?.emit('call-ended', { roomId: id });
    handleCallEnded();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  if (isLoading) return <div className="h-screen flex justify-center items-center bg-slate-900 text-white">Loading Consultation...</div>;

  return (
    <div className="h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">
            {data?.data?.patient?.name} &bull; {data?.data?.doctor?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Encrypted</span>
          <span className="text-emerald-400 text-sm flex items-center gap-1">
            <Activity className="h-4 w-4" /> Stable
          </span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black mt-16 mb-24">
        {callAccepted && !callEnded ? (
          <video 
            playsInline 
            ref={userVideo} 
            autoPlay 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            {isDoctor ? (
              <button onClick={callUser} className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-lg shadow-indigo-900/20">
                <Video className="h-5 w-5" /> Start Consultation
              </button>
            ) : (
              receivingCall && !callAccepted ? (
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-slate-700">
                  <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce">
                    <Video className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl text-white font-medium">Doctor is calling...</h3>
                  <button onClick={answerCall} className="px-8 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 font-medium shadow-lg shadow-emerald-900/20 w-full text-lg">
                    Answer Call
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p>Waiting for doctor to initiate call...</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Self Video (PiP) */}
        <div className="absolute bottom-6 right-6 w-64 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 z-20 transition-all hover:scale-105 cursor-move">
          <video 
            playsInline 
            muted 
            ref={myVideo} 
            autoPlay 
            className="w-full h-full object-cover transform -scale-x-100"
          />
          {(isMuted || isVideoOff) && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {isMuted && <div className="bg-red-500/80 p-1 rounded backdrop-blur-sm"><MicOff className="h-3 w-3 text-white" /></div>}
              {isVideoOff && <div className="bg-red-500/80 p-1 rounded backdrop-blur-sm"><VideoOff className="h-3 w-3 text-white" /></div>}
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-slate-900 flex justify-center items-center gap-4 absolute bottom-0 left-0 right-0 z-10">
        <button 
          onClick={toggleMute}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </button>

        {isDoctor && (
          <button className="h-14 w-14 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors">
            <MonitorUp className="h-6 w-6" />
          </button>
        )}

        <button className="h-14 w-14 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors relative">
          <MessageSquare className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-indigo-500 border-2 border-slate-700 rounded-full"></span>
        </button>

        <div className="w-8"></div> {/* Spacer */}

        <button 
          onClick={leaveCall}
          className="h-14 w-28 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-medium shadow-lg shadow-red-900/20 transition-all gap-2"
        >
          <PhoneOff className="h-5 w-5" /> End
        </button>
      </div>
    </div>
  );
};
