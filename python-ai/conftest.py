"""
conftest.py — root-level pytest configuration
==============================================
Installs a lightweight mediapipe stub into sys.modules BEFORE any test
module is imported. This lets the full test suite run on environments where
MediaPipe cannot be installed (e.g. Python 3.14, CI runners without native
MediaPipe wheels).

The stub mirrors the exact API surface used by:
  • vision/face_detector.py  — mp.solutions.face_detection.FaceDetection
  • vision/head_pose.py       — mp.solutions.face_mesh.FaceMesh
  • vision/gaze_estimator.py  — mp.solutions.face_mesh.FaceMesh

All detectors return "no detections" by default so the analyzer falls through
to the CLEAR / NO_FACE branches — exactly what the unit tests expect for
blank and noise frames.
"""

import sys
import types
from unittest.mock import MagicMock


# ── Build fake mediapipe module tree ─────────────────────────────────────────

def _make_detection_result(detections=None):
    """Return a fake MediaPipe detection result object."""
    result = MagicMock()
    result.detections = detections or []
    result.multi_face_landmarks = None
    return result


class _FakeFaceDetection:
    """Stub for mp.solutions.face_detection.FaceDetection."""

    def __init__(self, model_selection=0, min_detection_confidence=0.5):
        pass

    def process(self, frame_rgb):
        return _make_detection_result()

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class _FakeFaceMesh:
    """Stub for mp.solutions.face_mesh.FaceMesh."""

    def __init__(self, max_num_faces=1, refine_landmarks=False,
                 min_detection_confidence=0.5, min_tracking_confidence=0.5):
        pass

    def process(self, frame_rgb):
        return _make_detection_result()

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


# ── Assemble the fake mp.solutions namespace ──────────────────────────────────

_face_detection_ns = types.SimpleNamespace(
    FaceDetection=_FakeFaceDetection,
)

_face_mesh_ns = types.SimpleNamespace(
    FaceMesh=_FakeFaceMesh,
)

_solutions_ns = types.SimpleNamespace(
    face_detection=_face_detection_ns,
    face_mesh=_face_mesh_ns,
)

# Top-level mediapipe module
_mediapipe_mod = types.ModuleType("mediapipe")
_mediapipe_mod.solutions = _solutions_ns

# Register into sys.modules so any subsequent `import mediapipe` is a no-op
sys.modules.setdefault("mediapipe", _mediapipe_mod)
sys.modules.setdefault("mediapipe.solutions", _solutions_ns)  # type: ignore[assignment]
sys.modules.setdefault("mediapipe.solutions.face_detection", _face_detection_ns)  # type: ignore[assignment]
sys.modules.setdefault("mediapipe.solutions.face_mesh", _face_mesh_ns)  # type: ignore[assignment]
