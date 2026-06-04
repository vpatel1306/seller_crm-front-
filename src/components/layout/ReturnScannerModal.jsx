import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiCamera, FiAlertTriangle, FiSmartphone, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import CommonModal from '../common/CommonModal';
import api from '../../services/api';
import { toast } from '../../context/ToastContext';

const getFriendlyErrorMessage = (errorString) => {
  if (!errorString) return 'No active camera was detected or browser camera access permission was denied.';
  const err = errorString.toLowerCase();
  
  if (err.includes('permission') || err.includes('notallowederror') || err.includes('allowed') || err.includes('denied')) {
    return "Camera permission was denied. Please check your browser address bar to allow camera access for this site and refresh.";
  }
  if (err.includes('notfounderror') || err.includes('not found') || err.includes('no camera') || err.includes('requested device not found')) {
    return "No camera device was found on this system. Please check if your camera is plugged in properly or verify device manager.";
  }
  if (err.includes('secure') || err.includes('origin') || err.includes('http') || err.includes('navigator.mediadevices') || err.includes('getusermedia')) {
    return "Camera access is blocked over insecure HTTP connections. Please access the site using localhost (e.g. http://localhost:5173) or set up HTTPS.";
  }
  return errorString;
};

export default function ReturnScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'success' | 'error' | 'loading'
  const [scannedAwb, setScannedAwb] = useState('');
  
  const scannerRef = useRef(null);
  const scannerId = "return-qr-reader";
  
  // Reset states when modal is opened
  useEffect(() => {
    if (!isOpen) return;
    setScanStatus('idle');
    setScannedAwb('');
    setCameraError('');
    setHasCamera(true);
    setCameras([]);
    setActiveCameraId('');
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  // Start scanner when modal opens and camera state changes
  useEffect(() => {
    if (!isOpen || scanStatus === 'success' || scanStatus === 'loading') {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('Camera access requires a Secure Origin (HTTPS or localhost). If you are accessing this site via a local IP (e.g., http://192.168.x.x), please open it using http://localhost:5173 instead.');
        setIsScanning(false);
        return;
      }

      try {
        await stopScanner();
        
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;
        setIsScanning(true);

        const qrConfig = {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
          aspectRatio: 1.0
        };

        // If user manually switched and chose an active camera ID
        if (activeCameraId) {
          await html5QrCode.start(
            activeCameraId,
            qrConfig,
            (decodedText) => handleScanMatch(decodedText),
            () => {}
          );
          setHasCamera(true);
          return;
        }

        // Try environment facingMode first
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            qrConfig,
            (decodedText) => handleScanMatch(decodedText),
            () => {}
          );
          setHasCamera(true);
        } catch (envErr) {
          console.warn("Environment camera start failed, trying user camera:", envErr);
          // Try user facingMode (laptop built-in camera / front camera)
          await html5QrCode.start(
            { facingMode: "user" },
            qrConfig,
            (decodedText) => handleScanMatch(decodedText),
            () => {}
          );
          setHasCamera(true);
        }

        // Once successfully started, fetch camera devices for manual switching
        Html5Qrcode.getCameras().then(devices => {
          if (devices && devices.length > 0) {
            setCameras(devices);
          }
        }).catch((err) => {
          console.warn("Could not list camera devices", err);
        });

      } catch (err) {
        console.error("Failed to start scanner on any camera:", err);
        setHasCamera(false);
        setCameraError(err.message || 'Permission denied or no camera device connected.');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, activeCameraId, scanStatus]);

  const handleScanMatch = async (awb) => {
    if (!awb) return;
    
    // Play beep sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Could not play sound", e);
    }

    setScannedAwb(awb);
    setScanStatus('loading');
    
    await stopScanner();

    try {
      const response = await api.post('/scan-order-return', { awb_number: awb });
      setScanStatus('success');
      
      if (onScanSuccess) {
        onScanSuccess(awb, response.data);
      }
      
      setTimeout(() => {
        setScanStatus('idle');
        setScannedAwb('');
      }, 1500);
    } catch (err) {
      setScanStatus('error');
      setTimeout(() => {
        setScanStatus('idle');
        setScannedAwb('');
      }, 3000);
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={() => {
        stopScanner().then(() => {
          onClose();
        });
      }}
      title="Scan Return Parcel"
      size="md"
      showFooter={false}
      headerStyle="gradient"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-2">
        {hasCamera ? (
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-black shadow-inner aspect-square flex flex-col justify-center items-center">
            
            <div 
              id={scannerId} 
              className={`w-full h-full object-cover ${scanStatus !== 'idle' ? 'opacity-30' : 'opacity-100'}`}
            />

            {scanStatus === 'idle' && isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                <div className="w-[65%] h-[65%] border-2 border-dashed border-white/40 rounded-lg relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-sm"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-sm"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-sm"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-sm"></div>
                  
                  <div className="w-[90%] h-0.5 bg-primary/80 absolute shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce" />
                </div>
                <div className="mt-4 text-[0.65rem] font-bold text-white/70 uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Align Barcode / QR Code inside box
                </div>
              </div>
            )}

            {scanStatus === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-sm text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                <p className="text-xs font-black uppercase tracking-wider">Processing Scan...</p>
                <p className="text-[0.65rem] opacity-75 mt-1 font-mono">{scannedAwb}</p>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 backdrop-blur-sm text-emerald-400 p-6 text-center animate-fade-in animate-duration-150">
                <FiCheckCircle size={56} className="text-emerald-400 mb-3 animate-bounce" />
                <h4 className="text-lg font-black uppercase tracking-tight">Scan Success</h4>
                <p className="text-xs opacity-90 font-bold mt-1 max-w-[240px] truncate font-mono bg-emerald-900/40 px-3 py-1 rounded-default border border-emerald-800/40">
                  {scannedAwb}
                </p>
                <p className="text-[0.65rem] text-emerald-500 uppercase tracking-widest mt-4 animate-pulse">Ready for next parcel...</p>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-sm text-rose-400 p-6 text-center animate-fade-in animate-duration-150">
                <FiAlertTriangle size={56} className="text-rose-400 mb-3 animate-pulse" />
                <h4 className="text-lg font-black uppercase tracking-tight">Scan Failed</h4>
                <p className="text-xs opacity-90 font-medium mt-1">Please try again.</p>
                <p className="text-[0.65rem] text-rose-500 uppercase tracking-widest mt-4">Retrying...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm border border-dashed border-rose-200 bg-rose-50/50 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
              <FiAlertTriangle size={28} />
            </div>
            <h4 className="text-base font-black text-rose-900 uppercase tracking-tight">Camera Connection Error</h4>
            <p className="mt-2 text-xs font-bold text-rose-700/80 max-w-[280px]">
              {getFriendlyErrorMessage(cameraError)}
            </p>
            {cameraError && (
              <p className="mt-3 text-[0.6rem] font-mono text-rose-500 bg-rose-100/25 px-2 py-1.5 rounded-lg border border-rose-200/30 max-w-[280px] break-words">
                {cameraError}
              </p>
            )}
          </div>
        )}

        <div className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex items-start gap-3">
          <div className="rounded-lg bg-white p-2 text-primary shadow-sm border border-slate-100 flex-shrink-0 animate-pulse">
            <FiSmartphone size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">Scan on Mobile</h5>
            <p className="text-[0.7rem] text-slate-500 font-semibold leading-relaxed">
              If your desktop doesn't have a camera, you can open this page on your mobile phone's browser to scan directly using your phone's back camera.
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full justify-between items-center border-t border-slate-100 pt-4">
          {hasCamera && cameras.length > 1 ? (
            <button
              onClick={switchCamera}
              className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <FiRefreshCw size={14} className="text-slate-400" />
              <span>Switch Camera</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => stopScanner().then(() => onClose())}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
