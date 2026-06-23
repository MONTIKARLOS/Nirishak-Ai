import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress,
} from '@mui/material';
import LogoutIcon    from '@mui/icons-material/Logout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const IDLE_TIMEOUT_MS    = 15 * 60 * 1000; // 15 minutes
const WARNING_COUNTDOWN_S = 60;            // 60-second warning before logout

/**
 * SessionGuard — wraps protected content.
 * • Detects JWT near-expiry (decoded from localStorage).
 * • Auto-logs out after IDLE_TIMEOUT_MS of inactivity,
 *   with a 60-second warning dialog.
 * • Shows a snack-style banner when JWT < 5 minutes from expiry.
 */
export default function SessionGuard({ children }) {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('nirikshak_token');
  const [idleDialog, setIdleDialog]     = useState(false);
  const [countdown, setCountdown]       = useState(WARNING_COUNTDOWN_S);
  const [jwtWarning, setJwtWarning]     = useState(false);

  const idleTimerRef      = useRef(null);
  const countdownTimerRef = useRef(null);

  const doLogout = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownTimerRef.current);
    localStorage.removeItem('nirikshak_token');
    localStorage.removeItem('nirikshak_student');
    localStorage.removeItem('nirikshak_role');
    navigate('/login');
  }, [navigate]);

  const resetIdle = useCallback(() => {
    if (idleDialog) return; // don't reset while warning is visible
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIdleDialog(true);
      setCountdown(WARNING_COUNTDOWN_S);
      let c = WARNING_COUNTDOWN_S;
      countdownTimerRef.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(countdownTimerRef.current);
          doLogout();
        }
      }, 1000);
    }, IDLE_TIMEOUT_MS);
  }, [idleDialog, doLogout]);

  // Start idle watcher on mount
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle(); // initialise
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      clearTimeout(idleTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, [resetIdle]);

  // JWT expiry check — only for real JWTs (not demo token)
  useEffect(() => {
    if (!token || token === 'demo-offline-token') return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return;
      const expiresInMs = payload.exp * 1000 - Date.now();
      const WARN_THRESHOLD = 5 * 60 * 1000; // 5 min
      if (expiresInMs < 0) {
        doLogout();
      } else if (expiresInMs < WARN_THRESHOLD) {
        setJwtWarning(true);
      } else {
        const timer = setTimeout(() => setJwtWarning(true), expiresInMs - WARN_THRESHOLD);
        return () => clearTimeout(timer);
      }
    } catch (_) { /* not a JWT — demo mode */ }
  }, [token, doLogout]);

  const handleStayActive = () => {
    clearInterval(countdownTimerRef.current);
    setIdleDialog(false);
    resetIdle();
  };

  return (
    <>
      {/* JWT expiry banner */}
      {jwtWarning && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          bgcolor: 'rgba(245,158,11,0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 2, py: 0.8, px: 2,
          animation: 'slideDown 0.3s ease',
          '@keyframes slideDown': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } },
        }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: '#1A1000' }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1000' }}>
            Your session expires soon. Save your progress.
          </Typography>
          <Button size="small" onClick={doLogout} sx={{ color: '#1A1000', fontWeight: 700, fontSize: '0.72rem', minWidth: 0 }}>
            Re-login
          </Button>
        </Box>
      )}

      {/* Idle warning dialog */}
      <Dialog
        open={idleDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15,14,26,0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: '20px',
          }
        }}
      >
        <DialogTitle sx={{ color: '#FBBF24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ color: '#FBBF24' }} />
          Session Expiring Soon
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', mb: 2 }}>
            You've been inactive for 15 minutes. You will be automatically logged out in:
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '3.5rem', color: countdown <= 10 ? '#EF4444' : '#FBBF24', lineHeight: 1, transition: 'color 0.3s' }}>
              {countdown}s
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(countdown / WARNING_COUNTDOWN_S) * 100}
            sx={{
              height: 6, borderRadius: 99,
              bgcolor: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                background: countdown <= 10
                  ? 'linear-gradient(90deg, #EF4444, #F87171)'
                  : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                transition: 'background 0.5s ease',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={doLogout}
            sx={{ borderColor: 'rgba(239,68,68,0.4)', color: '#F87171', borderRadius: '10px', '&:hover': { borderColor: '#F87171', bgcolor: 'rgba(239,68,68,0.1)' } }}
          >
            Logout
          </Button>
          <Button
            id="btn-stay-active"
            variant="contained"
            onClick={handleStayActive}
            sx={{ flex: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', fontWeight: 700 }}
          >
            Stay Active
          </Button>
        </DialogActions>
      </Dialog>

      {children}
    </>
  );
}
