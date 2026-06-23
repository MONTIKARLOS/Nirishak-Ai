import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import MicIcon    from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const AUDIO_THRESHOLD      = 0.18;  // 0–1 normalised volume above which we flag
const SUSTAINED_FRAMES     = 6;     // consecutive high-volume frames before alert
const POLL_INTERVAL_MS     = 500;   // check audio level every 500 ms
const COOLDOWN_MS          = 5000;  // min gap between consecutive audio alerts

/**
 * AudioMonitor
 * Uses Web Audio API to monitor microphone volume in real time.
 * Fires onAudioAlert when sustained speech is detected.
 */
export default function AudioMonitor({ onAudioAlert }) {
  const [permitted, setPermitted]     = useState(null); // null=asking, true, false
  const [level, setLevel]             = useState(0);    // 0–1 live volume
  const [alerting, setAlerting]       = useState(false);

  const streamRef      = useRef(null);
  const analyserRef    = useRef(null);
  const intervalRef    = useRef(null);
  const highFramesRef  = useRef(0);
  const lastAlertRef   = useRef(0);
  const dataArrayRef   = useRef(null);

  const startMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setPermitted(true);

      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      intervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avg = dataArrayRef.current.reduce((s, v) => s + v, 0) / dataArrayRef.current.length / 255;
        setLevel(avg);

        if (avg > AUDIO_THRESHOLD) {
          highFramesRef.current += 1;
          if (highFramesRef.current >= SUSTAINED_FRAMES) {
            const now = Date.now();
            if (now - lastAlertRef.current > COOLDOWN_MS) {
              lastAlertRef.current = now;
              setAlerting(true);
              onAudioAlert && onAudioAlert({
                alertType: 'AUDIO_DETECTED',
                severity: 'HIGH',
                description: 'Sustained audio/speech detected during exam.',
              });
              setTimeout(() => setAlerting(false), 2000);
            }
            highFramesRef.current = 0;
          }
        } else {
          highFramesRef.current = Math.max(0, highFramesRef.current - 1);
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      console.warn('AudioMonitor: mic access denied', err);
      setPermitted(false);
    }
  }, [onAudioAlert]);

  useEffect(() => {
    startMonitor();
    return () => {
      clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [startMonitor]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const barColor = alerting ? '#EF4444' : level > AUDIO_THRESHOLD ? '#F59E0B' : '#10B981';

  return (
    <Box sx={{
      p: 1.5, borderRadius: '10px',
      background: alerting ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${alerting ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.07)'}`,
      transition: 'border-color 0.3s, background 0.3s',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: permitted === false ? 0 : 1 }}>
        {permitted === false
          ? <MicOffIcon sx={{ fontSize: 14, color: '#6B7280' }} />
          : <MicIcon    sx={{ fontSize: 14, color: alerting ? '#EF4444' : '#A5B4FC', transition: 'color 0.3s' }} />
        }
        <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>
          Audio Monitor
        </Typography>
        {alerting && (
          <Box sx={{ px: 0.8, py: 0.2, borderRadius: '5px', bgcolor: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#F87171', letterSpacing: '0.06em' }}>ALERT</Typography>
          </Box>
        )}
      </Box>

      {permitted === false ? (
        <Tooltip title="Allow microphone access for audio proctoring" placement="right">
          <Typography sx={{ fontSize: '0.65rem', color: '#6B7280', fontStyle: 'italic' }}>
            Mic access denied — audio monitoring disabled
          </Typography>
        </Tooltip>
      ) : permitted === null ? (
        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Requesting mic…</Typography>
      ) : (
        <>
          {/* Level bar */}
          <Box sx={{ height: 6, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.07)', overflow: 'hidden', mb: 0.5 }}>
            <Box sx={{
              height: '100%', borderRadius: 99,
              width: `${Math.min(level * 100 * 3.5, 100)}%`,
              bgcolor: barColor,
              transition: 'width 0.15s ease, background-color 0.3s ease',
            }} />
          </Box>

          {/* Mini bar chart — last 8 ticks */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1, borderRadius: '2px',
                  bgcolor: barColor,
                  height: `${Math.max(15, Math.random() * (level > AUDIO_THRESHOLD ? 100 : 30))}%`,
                  opacity: 0.5 + (i / 12) * 0.5,
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </Box>

          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', mt: 0.5 }}>
            {alerting ? '⚠ Speech detected' : level > AUDIO_THRESHOLD ? 'High volume…' : 'Monitoring…'}
          </Typography>
        </>
      )}
    </Box>
  );
}
