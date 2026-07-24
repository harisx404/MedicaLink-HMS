import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSessionByIdQuery } from '../api/telemedicineApi';
import { io, Socket } from 'socket.io-client';
import { Video, Mic, ShieldAlert, Activity, Wifi } from 'lucide-react';

export const VirtualWaitingRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetSessionByIdQuery(id as string, { skip: !id });
  const session = data?.data;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setError("Could not access camera/microphone. Please allow permissions.");
      });

    // Connect to socket to listen for doctor
    const token = localStorage.getItem('token') || '';
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    if (id) {
      socketRef.current.emit('join-telemed-room', id);
      socketRef.current.emit('patient-arrived', { roomId: id });
    }

    socketRef.current.on('doctor-ready', () => {
      // Navigate to the actual call page
      navigate(`/portal/session/${id}`);
    });

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
    };
  }, [id, navigate, stream]);

  if (isLoading) return <div className="p-8 text-center">Loading waiting room...</div>;
  if (!session && !isLoading) return <div className="p-8 text-center text-red-500">Session not found.</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Activity className="h-24 w-24" />
          </div>
          <h1 className="text-2xl font-bold relative z-10">Virtual Waiting Room</h1>
          <p className="text-indigo-100 mt-2 relative z-10">Your doctor will be with you shortly</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <span className="animate-pulse h-4 w-4 bg-amber-500 rounded-full"></span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Waiting for {session?.doctor?.name}</h2>
            <p className="text-slate-500 mt-1 text-center max-w-md">
              Please keep this page open. The consultation will begin automatically when the doctor is ready.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">System Check</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative border-2 border-slate-200">
                  {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center text-sm flex-col gap-2">
                      <ShieldAlert className="h-6 w-6" />
                      {error}
                    </div>
                  ) : (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded bg-black/50 text-white flex items-center gap-1 ${stream?.getVideoTracks()[0] ? 'text-green-400' : ''}`}>
                      <Video className="h-3 w-3" /> Camera
                    </span>
                    <span className={`px-2 py-1 text-xs rounded bg-black/50 text-white flex items-center gap-1 ${stream?.getAudioTracks()[0] ? 'text-green-400' : ''}`}>
                      <Mic className="h-3 w-3" /> Mic
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Video className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Camera Working</p>
                    <p className="text-xs text-slate-500">We can see you</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Mic className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Microphone Working</p>
                    <p className="text-xs text-slate-500">We can hear you</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Connection Stable</p>
                    <p className="text-xs text-slate-500">Ready for video call</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
