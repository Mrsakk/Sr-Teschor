import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { RefreshCw, HelpCircle, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function GoogleAuthButton({ text = 'Continue with Google', role = 'customer' }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const tokenClientRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { loginWithGoogle } = useAuthStore();
  const toast = useToastStore();

  // Helper to decode JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleAuthPayload = async (payload) => {
    setIsProcessing(true);
    try {
      const result = await loginWithGoogle({
        ...payload,
        role: role || 'customer',
      });

      if (result.success) {
        toast.success(`Welcome, ${result.user.name || 'Traveler'}! 🎉`);
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'business') {
          navigate('/business/dashboard');
        } else {
          navigate(redirect);
        }
      } else {
        toast.error(result.error || 'Google authentication failed.');
      }
    } catch (err) {
      toast.error('Failed to complete Google authentication.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle OAuth Redirect URL hash if redirect flow was used
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('id_token='))) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');
      if (accessToken || idToken) {
        handleAuthPayload({
          access_token: accessToken,
          id_token: idToken,
        });
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Load Google Identity Services SDK
  useEffect(() => {
    const scriptId = 'google-gsi-client';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptReady(true);
      };
      document.head.appendChild(script);
    } else {
      setScriptReady(true);
    }
  }, []);

  // Initialize Token Client
  useEffect(() => {
    if (!scriptReady || !window.google?.accounts?.oauth2) return;

    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setIsProcessing(false);
            if (tokenResponse.error === 'invalid_client' || tokenResponse.error_description?.includes('origin')) {
              setShowConfigModal(true);
            } else {
              toast.error(`Google Sign-In error: ${tokenResponse.error}`);
            }
            return;
          }
          if (tokenResponse.access_token) {
            await handleAuthPayload({ access_token: tokenResponse.access_token });
          }
        },
      });
    } catch (err) {
      console.warn('Google OAuth TokenClient init error:', err);
    }
  }, [scriptReady]);

  const handleGoogleClick = () => {
    if (isProcessing) return;

    // 1. If Google Token Client initialized, trigger modern OAuth popup
    if (tokenClientRef.current) {
      setIsProcessing(true);
      try {
        tokenClientRef.current.requestAccessToken();
      } catch (e) {
        setIsProcessing(false);
        setShowConfigModal(true);
      }
      return;
    }

    // 2. If GIS accounts.id available, prompt One-Tap / popup
    if (window.google?.accounts?.id) {
      setIsProcessing(true);
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (res) => {
            if (res.credential) {
              const decoded = parseJwt(res.credential);
              await handleAuthPayload({
                id_token: res.credential,
                google_id: decoded?.sub,
                email: decoded?.email,
                name: decoded?.name,
                picture: decoded?.picture,
              });
            } else {
              setIsProcessing(false);
            }
          },
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsProcessing(false);
          }
        });
      } catch (err) {
        setIsProcessing(false);
        setShowConfigModal(true);
      }
      return;
    }

    // 3. Fallback direct OAuth2 authorization URL redirect
    const redirectUri = window.location.origin + '/login';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=email%20profile%20openid&nonce=${Date.now()}`;
    window.location.href = authUrl;
  };

  // Instant Dev Simulation with user's Google account
  const handleDevQuickLogin = async (simEmail = 'skh871081@gmail.com') => {
    await handleAuthPayload({
      email: simEmail,
      name: simEmail.split('@')[0],
      google_id: '10982349081234988888',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    });
  };

  return (
    <div className="w-full space-y-2">
      {/* Primary Google Auth Button */}
      <button
        type="button"
        id="google-auth-btn"
        onClick={handleGoogleClick}
        disabled={isProcessing}
        className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md hover:border-slate-300 disabled:opacity-60 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {/* Origin Helper Link */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="text-slate-500 hover:text-orange-600 flex items-center gap-1 font-medium transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Google 401 Error Guide (Fix Origin)</span>
        </button>

        <button
          type="button"
          onClick={() => handleDevQuickLogin('skh871081@gmail.com')}
          className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 bg-orange-50 hover:bg-orange-100 py-1 px-2.5 rounded-lg border border-orange-200 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span>Quick Test Google</span>
        </button>
      </div>

      {/* Google Cloud Origin Setup Guide Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-md border border-slate-100 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  ដំណោះស្រាយបញ្ហា Google 401: invalid_client (No Registered Origin)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Google តម្រូវឱ្យចុះឈ្មោះ URL (Origin) នៃវេបសាយនៅក្នុង <strong>Google Cloud Console</strong> ដើម្បីអនុញ្ញាតឱ្យ Google Popup ដំណើរការ។
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">1</span>
                បើក Google Cloud Console Credentials:
              </p>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                <span>បើក console.cloud.google.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">2</span>
                ចុចលើ Client ID របស់អ្នក រួចបន្ថែមក្នុង <strong>"Authorized JavaScript origins"</strong>:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1 select-all">
                <div>http://localhost:5173</div>
                <div>http://localhost</div>
                <div>http://127.0.0.1:5173</div>
              </div>

              <p className="font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">3</span>
                បន្ថែមក្នុង <strong>"Authorized redirect URIs"</strong>:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1 select-all">
                <div>http://localhost:5173</div>
                <div>http://localhost:5173/login</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  handleDevQuickLogin('skh871081@gmail.com');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>តេស្ត Login ជាមួយ skh871081@gmail.com ភ្លាមៗ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
