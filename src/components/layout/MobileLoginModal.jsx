import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { FiSmartphone, FiRefreshCw, FiAlertCircle, FiClock, FiKey } from 'react-icons/fi';
import CommonModal from '../common/CommonModal';
import api from '../../services/api';

export default function MobileLoginModal({ isOpen, onClose, activeAccountId }) {
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Function to fetch token and generate QR code
  const generateTokenAndQR = useCallback(async () => {
    setLoading(true);
    setError('');
    setQrCodeUrl('');
    try {
      // POST api, no payload
      const response = await api.post('/generate-mobile-token');
      if (response.data?.status && response.data?.data) {
        const { token: receivedToken, expires_at } = response.data.data;
        setToken(receivedToken);
        setExpiresAt(expires_at);

        // Generate the login URL
        const loginUrl = `${window.location.origin}/?token=${receivedToken}${activeAccountId ? `&account_id=${activeAccountId}` : ''}`;
        
        // Generate QR code as Base64 Data URL
        const qrUrl = await QRCode.toDataURL(loginUrl, {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f766e', // Primary teal color
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrUrl);
      } else {
        throw new Error(response.data?.message || 'Failed to generate token.');
      }
    } catch (err) {
      console.error('Error generating mobile token:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to connect to server. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch token when modal opens
  useEffect(() => {
    if (isOpen) {
      generateTokenAndQR();
    } else {
      // Reset states on close
      setToken('');
      setExpiresAt('');
      setQrCodeUrl('');
      setError('');
      setTimeLeft(0);
    }
  }, [isOpen, generateTokenAndQR]);

  // Countdown timer logic
  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft(0);
        return;
      }
      setTimeLeft(Math.floor(difference / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mobile Login Sync"
      size="md"
      showFooter={false}
      headerStyle="gradient"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-black text-slate-600 uppercase tracking-wider">Generating Secure Token...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-sm border border-dashed border-rose-200 bg-rose-50/50 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
              <FiAlertCircle size={28} />
            </div>
            <h4 className="text-base font-black text-rose-900 uppercase tracking-tight">Generation Failed</h4>
            <p className="mt-2 text-xs font-bold text-rose-700/80 max-w-[280px]">
              {error}
            </p>
            <button
              onClick={generateTokenAndQR}
              className="mt-4 flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-black text-white uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-sm"
            >
              <FiRefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <>
            {/* QR Code Container */}
            <div className="relative flex flex-col items-center justify-center">
              <div className={`relative overflow-hidden rounded-2xl border-4 border-slate-100 bg-white p-4 shadow-lg transition-all ${isExpired ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}>
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Login QR Code"
                    className="h-64 w-64 object-contain"
                  />
                ) : (
                  <div className="h-64 w-64 bg-slate-50 flex items-center justify-center text-slate-400">
                    Generating...
                  </div>
                )}
              </div>

              {/* Expired Overlay */}
              {isExpired && expiresAt && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] p-6 text-center">
                  <div className="rounded-full bg-rose-100 p-3 text-rose-600 mb-2 shadow-sm border border-rose-200">
                    <FiClock size={28} />
                  </div>
                  <h4 className="text-base font-black text-rose-900 uppercase tracking-tight">QR Code Expired</h4>
                  <p className="text-xs font-bold text-rose-700/80 max-w-[200px] mt-1">
                    This login token has expired for security reasons.
                  </p>
                  <button
                    onClick={generateTokenAndQR}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black text-white uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-md active:scale-95"
                  >
                    <FiRefreshCw size={14} />
                    <span>Regenerate QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Expiration Timer Banner */}
            {!isExpired && timeLeft > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm transition-colors ${
                timeLeft < 60 
                  ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                  : 'bg-primary/5 text-primary border-primary/10'
              }`}>
                <FiClock size={14} />
                <span>Expires in: {formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Instruction Box */}
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 text-primary shadow-sm border border-slate-100 flex-shrink-0 animate-pulse">
                <FiSmartphone size={20} />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">Scan to Log In</h5>
                <p className="text-[0.7rem] text-slate-500 font-semibold leading-relaxed">
                  Open your mobile phone camera or scanner app and point it at the QR code. You will be automatically logged in and redirected to the dashboard.
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 w-full justify-between items-center border-t border-slate-100 pt-4">
              <button
                onClick={generateTokenAndQR}
                disabled={isExpired}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <FiRefreshCw size={14} className="text-slate-400" />
                <span>Refresh Token</span>
              </button>
              
              <button
                onClick={onClose}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </CommonModal>
  );
}
