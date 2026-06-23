import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, LinearProgress,
  CircularProgress, Tooltip, Avatar,
} from '@mui/material';
import ShieldIcon          from '@mui/icons-material/Shield';
import PlayArrowIcon       from '@mui/icons-material/PlayArrow';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import CancelIcon          from '@mui/icons-material/Cancel';
import VideocamIcon        from '@mui/icons-material/Videocam';
import MicIcon             from '@mui/icons-material/Mic';
import WifiIcon            from '@mui/icons-material/Wifi';
import BrowserUpdatedIcon  from '@mui/icons-material/BrowserUpdated';
import LogoutIcon          from '@mui/icons-material/Logout';
import EmojiEventsIcon     from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon    from '@mui/icons-material/WarningAmber';
import AccessTimeIcon      from '@mui/icons-material/AccessTime';
import SchoolIcon          from '@mui/icons-material/School';

// ── Demo exam catalogue ────────────────────────────────────────────────────────
const DEMO_EXAMS = [
  {
    id: 'demo-exam-001',
    title: 'General Aptitude',
    subject: 'Quantitative + Logical',
    duration: '60 min',
    questions: 8,
    difficulty: 'MEDIUM',
    marks: 15,
    status: 'AVAILABLE',
    icon: '📐',
  },
  {
    id: 'demo-exam-002',
    title: 'Verbal Reasoning',
    subject: 'English + Comprehension',
    duration: '45 min',
    questions: 10,
    difficulty: 'EASY',
    marks: 10,
    status: 'AVAILABLE',
    icon: '📝',
  },
  {
    id: 'demo-exam-003',
    title: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    duration: '90 min',
    questions: 15,
    difficulty: 'HARD',
    marks: 30,
    status: 'UPCOMING',
    icon: '💻',
  },
];

const DEMO_SESSIONS = [
  { id: 'sess-abc123', exam: 'General Aptitude', score: '11/15', integrity: 87, violations: 2, date: '20 Jun 2026', passed: true },
  { id: 'sess-def456', exam: 'Verbal Reasoning',  score: '8/10',  integrity: 95, violations: 1, date: '18 Jun 2026', passed: true },
  { id: 'sess-ghi789', exam: 'Mock Test #1',       score: '4/20',  integrity: 42, violations: 9, date: '15 Jun 2026', passed: false },
];

const DIFF_COLORS = {
  EASY:     { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', border: 'rgba(16,185,129,0.3)'  },
  MEDIUM:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)'  },
  HARD:     { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', border: 'rgba(239,68,68,0.3)'   },
  UPCOMING: { bg: 'rgba(129,140,248,0.12)', color: '#818CF8', border: 'rgba(129,140,248,0.3)' },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ReadinessRow({ icon, label, status }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8 }}>
      <Box sx={{ color: status === 'checking' ? '#818CF8' : status ? '#10B981' : '#EF4444', display: 'flex' }}>
        {icon}
      </Box>
      <Typography sx={{ flex: 1, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
        {label}
      </Typography>
      {status === 'checking'
        ? <CircularProgress size={14} sx={{ color: '#818CF8' }} />
        : status
          ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
          : <CancelIcon      sx={{ fontSize: 16, color: '#EF4444' }} />
      }
    </Box>
  );
}

function StatPill({ value, label, color = '#818CF8' }) {
  return (
    <Box sx={{ textAlign: 'center', px: 2 }}>
      <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.8rem', color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', mt: 0.4 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const student  = JSON.parse(localStorage.getItem('nirikshak_student') || '{}');
  const role     = localStorage.getItem('nirikshak_role') || 'STUDENT';

  // Readiness checks
  const [ready, setReady] = useState({ camera: 'checking', mic: 'checking', network: 'checking', browser: null });
  const [selectedExam, setSelectedExam] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // Camera check
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { s.getTracks().forEach(t => t.stop()); setReady(r => ({ ...r, camera: true })); })
      .catch(() => setReady(r => ({ ...r, camera: false })));

    // Mic check
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => { s.getTracks().forEach(t => t.stop()); setReady(r => ({ ...r, mic: true })); })
      .catch(() => setReady(r => ({ ...r, mic: false })));

    // Network check (simple ping)
    const ok = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    setReady(r => ({ ...r, network: ok }));

    // Browser check — needs ES2020+
    const isModern = typeof BigInt !== 'undefined' && typeof Promise.allSettled === 'function';
    setReady(r => ({ ...r, browser: isModern }));
  }, []);

  const allReady = ready.camera && ready.mic !== false; // mic failure is a warning, not a blocker

  const handleStartExam = () => {
    if (!selectedExam) return;
    setStarting(true);
    setTimeout(() => navigate(`/exam/${selectedExam.id}`), 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('nirikshak_token');
    localStorage.removeItem('nirikshak_student');
    localStorage.removeItem('nirikshak_role');
    navigate('/login');
  };

  const initials = (student.name || 'D S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avgIntegrity = Math.round(DEMO_SESSIONS.reduce((s, x) => s + x.integrity, 0) / DEMO_SESSIONS.length);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 15% 60%, #1e1b4b 0%, #06050F 55%), radial-gradient(ellipse at 85% 20%, #2d1f5e 0%, transparent 45%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated grid overlay */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }} />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: { xs: 2, md: 4 }, py: 1.5,
        background: 'rgba(6,5,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(129,140,248,0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon sx={{ fontSize: 22, color: '#818CF8', filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.6))' }} />
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Nirikshak <Box component="span" sx={{ color: '#818CF8' }}>AI</Box>
          </Typography>
        </Box>

        <Chip
          label={role === 'PROCTOR' ? '🎓 Proctor' : '🎒 Student'}
          size="small"
          sx={{ bgcolor: 'rgba(129,140,248,0.15)', color: '#A5B4FC', border: '1px solid rgba(129,140,248,0.25)', fontSize: '0.7rem', fontWeight: 700 }}
        />

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(99,102,241,0.4)', fontSize: '0.75rem', fontWeight: 800, border: '1.5px solid rgba(129,140,248,0.4)' }}>
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{student.name || 'Demo Student'}</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{student.email || 'demo@nirikshak.ai'}</Typography>
          </Box>
          <Tooltip title="Logout">
            <Button
              size="small" startIcon={<LogoutIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleLogout}
              sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', borderRadius: '8px', px: 1.2,
                '&:hover': { color: '#F87171', bgcolor: 'rgba(239,68,68,0.1)' }, transition: 'all 0.2s' }}
            >Logout</Button>
          </Tooltip>
        </Box>
      </Box>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4, position: 'relative', zIndex: 1 }}>

        {/* Welcome banner */}
        <Box sx={{ mb: 4, animation: 'pageIn 0.5s cubic-bezier(0.4,0,0.2,1)', '@keyframes pageIn': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
            Welcome back,{' '}
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {(student.name || 'Demo Student').split(' ')[0]}
            </Box> 👋
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', mt: 0.8 }}>
            Your proctored exam dashboard — select an exam below to begin.
          </Typography>
        </Box>

        {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', gap: 0,
          mb: 4, p: 2.5,
          background: 'rgba(10,9,25,0.7)',
          border: '1px solid rgba(129,140,248,0.15)',
          borderRadius: '18px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'pageIn 0.5s 0.1s cubic-bezier(0.4,0,0.2,1) both',
          overflowX: 'auto',
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}>
          <StatPill value={DEMO_SESSIONS.length} label="Sessions taken" color="#818CF8" />
          <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.07)', mx: 1 }} />
          <StatPill value={`${avgIntegrity}%`} label="Avg integrity" color={avgIntegrity >= 80 ? '#10B981' : avgIntegrity >= 60 ? '#F59E0B' : '#EF4444'} />
          <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.07)', mx: 1 }} />
          <StatPill value={DEMO_SESSIONS.filter(s => s.passed).length} label="Exams passed" color="#10B981" />
          <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.07)', mx: 1 }} />
          <StatPill value={DEMO_SESSIONS.reduce((s, x) => s + x.violations, 0)} label="Total violations" color="#EF4444" />
        </Box>

        {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3, mb: 3 }}>

          {/* LEFT — Exam selector */}
          <Box sx={{ animation: 'pageIn 0.5s 0.15s cubic-bezier(0.4,0,0.2,1) both' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 3, height: 16, bgcolor: '#818CF8', borderRadius: 99 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Available Exams
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {DEMO_EXAMS.map(exam => {
                const isSelected  = selectedExam?.id === exam.id;
                const isUpcoming  = exam.status === 'UPCOMING';
                const diffStyle   = DIFF_COLORS[isUpcoming ? 'UPCOMING' : exam.difficulty];
                return (
                  <Box
                    key={exam.id}
                    onClick={() => !isUpcoming && setSelectedExam(exam)}
                    sx={{
                      p: 2.5, borderRadius: '16px',
                      background: isSelected
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(10,9,25,0.65)',
                      backdropFilter: 'blur(16px)',
                      border: `1.5px solid ${isSelected ? 'rgba(129,140,248,0.5)' : 'rgba(129,140,248,0.1)'}`,
                      boxShadow: isSelected ? '0 4px 24px rgba(99,102,241,0.2)' : '0 2px 12px rgba(0,0,0,0.3)',
                      cursor: isUpcoming ? 'not-allowed' : 'pointer',
                      opacity: isUpcoming ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': !isUpcoming ? {
                        border: '1.5px solid rgba(129,140,248,0.4)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 28px rgba(99,102,241,0.18)',
                      } : {},
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0, mt: 0.3 }}>{exam.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                            {exam.title}
                          </Typography>
                          <Chip
                            label={isUpcoming ? 'Upcoming' : exam.difficulty}
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', mb: 1 }}>
                          {exam.subject}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: '#818CF8' }} />
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{exam.duration}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon sx={{ fontSize: 13, color: '#818CF8' }} />
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{exam.questions} Qs · {exam.marks} marks</Typography>
                          </Box>
                        </Box>
                      </Box>
                      {isSelected && (
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Start button */}
            <Box sx={{ mt: 2.5 }}>
              <Button
                id="btn-start-exam"
                variant="contained"
                fullWidth
                size="large"
                startIcon={starting ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                onClick={handleStartExam}
                disabled={!selectedExam || !allReady || starting}
                sx={{
                  py: 1.6, borderRadius: '14px', fontSize: '1rem',
                  fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(99,102,241,0.5)' },
                  '&:disabled': { background: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.3)', boxShadow: 'none' },
                  transition: 'all 0.2s ease',
                }}
              >
                {starting ? 'Launching Exam…' : selectedExam ? `Start: ${selectedExam.title} →` : 'Select an exam above'}
              </Button>
              {!allReady && ready.camera === false && (
                <Typography sx={{ textAlign: 'center', mt: 1, fontSize: '0.72rem', color: '#F87171' }}>
                  ⚠ Camera access required to start an exam
                </Typography>
              )}
            </Box>
          </Box>

          {/* RIGHT — System readiness + recent sessions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'pageIn 0.5s 0.2s cubic-bezier(0.4,0,0.2,1) both' }}>

            {/* System Readiness */}
            <Box sx={{
              p: 2.5, borderRadius: '16px',
              background: 'rgba(10,9,25,0.7)',
              border: '1px solid rgba(129,140,248,0.15)',
              backdropFilter: 'blur(16px)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 3, height: 14, bgcolor: '#818CF8', borderRadius: 99 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  System Readiness
                </Typography>
              </Box>

              <ReadinessRow icon={<VideocamIcon sx={{ fontSize: 18 }} />} label="Camera access"      status={ready.camera}  />
              <ReadinessRow icon={<MicIcon       sx={{ fontSize: 18 }} />} label="Microphone access" status={ready.mic}     />
              <ReadinessRow icon={<WifiIcon      sx={{ fontSize: 18 }} />} label="Network connection" status={ready.network} />
              <ReadinessRow icon={<BrowserUpdatedIcon sx={{ fontSize: 18 }} />} label="Browser compatible" status={ready.browser} />

              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>System score</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#818CF8', fontWeight: 700 }}>
                    {[ready.camera, ready.mic, ready.network, ready.browser].filter(Boolean).length}/4
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={[ready.camera, ready.mic, ready.network, ready.browser].filter(Boolean).length * 25}
                  sx={{
                    height: 5, borderRadius: 99,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 99,
                      background: 'linear-gradient(90deg, #6366F1, #A78BFA)',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Recent Sessions */}
            <Box sx={{
              p: 2.5, borderRadius: '16px',
              background: 'rgba(10,9,25,0.7)',
              border: '1px solid rgba(129,140,248,0.15)',
              backdropFilter: 'blur(16px)',
              flex: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 3, height: 14, bgcolor: '#818CF8', borderRadius: 99 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Recent Sessions
                </Typography>
              </Box>

              {DEMO_SESSIONS.map((s, i) => (
                <Box
                  key={s.id}
                  onClick={() => navigate(`/results/${s.id}`)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    py: 1.2, px: 1.5, borderRadius: '10px', mb: 0.8,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', transform: 'translateX(3px)' },
                    animation: `rowIn 0.3s ease ${i * 0.06}s both`,
                    '@keyframes rowIn': { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
                  }}
                >
                  <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: s.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', border: `1px solid ${s.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
                    {s.passed
                      ? <EmojiEventsIcon sx={{ fontSize: 14, color: '#10B981' }} />
                      : <WarningAmberIcon sx={{ fontSize: 14, color: '#EF4444' }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#E8E7FF', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.exam}
                    </Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', mt: 0.2 }}>
                      {s.date} · {s.violations} violation{s.violations !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: s.passed ? '#10B981' : '#EF4444', lineHeight: 1 }}>{s.score}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: `${s.integrity >= 80 ? '#10B981' : s.integrity >= 60 ? '#F59E0B' : '#EF4444'}`, fontWeight: 600, mt: 0.2 }}>
                      {s.integrity}% integrity
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 2 }}>
          <ShieldIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
            Nirikshak AI · Privacy-first proctoring · Made with ❤️ by Surajj
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
