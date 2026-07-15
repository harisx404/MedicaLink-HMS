import { useState, useRef } from 'react';
import { useGetConsentsQuery, useSignConsentMutation } from '../api/consentsApi';
import { FileSignature, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function ConsentManagement() {
  const { data: consents = [], isLoading } = useGetConsentsQuery();
  const [signConsent] = useSignConsentMutation();
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleSign = async () => {
    if (!selectedConsent || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    
    await signConsent({
      id: selectedConsent._id,
      signatureData: dataUrl,
      signedBy: 'Patient Signature'
    });
    
    setIsModalOpen(false);
    setSelectedConsent(null);
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Consent Management</h1>
          <p className="text-muted-foreground">Digital signatures and electronic consent forms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading consents...</div>
        ) : (
          consents.map((consent) => (
            <div key={consent._id} className="bg-card rounded-xl border border-border/50 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <FileSignature className="h-6 w-6" />
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  consent.isSigned ? 'bg-emerald-500/10 text-emerald-600' : 
                  consent.isRevoked ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {consent.isSigned ? <CheckCircle className="h-3 w-3" /> : 
                   consent.isRevoked ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {consent.isSigned ? 'Signed' : consent.isRevoked ? 'Revoked' : 'Pending'}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{consent.consentType.replace('_', ' ')}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{consent.content}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(consent.createdAt), 'MMM d, yyyy')}
                </span>
                {!consent.isSigned && !consent.isRevoked && (
                  <button 
                    onClick={() => {
                      setSelectedConsent(consent);
                      setIsModalOpen(true);
                    }}
                    className="text-sm text-indigo-500 font-medium hover:text-indigo-600"
                  >
                    Collect Signature &rarr;
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedConsent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-indigo-500" />
                Digital Signature
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="text-sm text-muted-foreground mb-6 bg-muted/30 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Consent Terms:</p>
                {selectedConsent.content}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sign Here:</label>
                <div className="border-2 border-dashed border-border/60 rounded-xl overflow-hidden bg-background">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={200}
                    className="w-full touch-none cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>Draw your signature inside the box</span>
                  <button 
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                    }}
                    className="text-rose-500 hover:text-rose-600 font-medium"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSign}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
