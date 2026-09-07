import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [script, setScript] = useState("");

  const [speed, setSpeed] = useState(1);
  const [scrolling, setScrolling] = useState(false);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // =========================
  // CAMERA
  // =========================

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (error) {
          console.error("Video play error:", error);
        }
      }

      setCameraOn(true);
    } catch (error) {
      console.error("CAMERA ERROR:", error);

      if (error instanceof DOMException) {
        alert(`${error.name}: ${error.message}`);
      } else {
        alert("Camera access failed.");
      }
    }
  };

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // =========================
  // TELEPROMPTER SCROLL
  // =========================

  useEffect(() => {
    if (!scrolling) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      return;
    }

    const scroll = () => {
      const element = scrollRef.current;

      if (!element) return;

      element.scrollTop += 0.35 * speed;

      const reachedBottom =
        element.scrollTop + element.clientHeight >=
        element.scrollHeight - 2;

      if (reachedBottom) {
        setScrolling(false);
        return;
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [scrolling, speed]);

  // =========================
  // RESET SCROLL
  // =========================

  const resetScroll = () => {
    setScrolling(false);

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  // =========================
  // TIMER
  // =========================

  useEffect(() => {
    let interval: number | undefined;

    if (recording) {
      interval = window.setInterval(() => {
        setSeconds((previous) => previous + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [recording]);

  // =========================
  // FORMAT TIMER
  // =========================

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");

    const secondsPart = (totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${secondsPart}`;
  };

  // =========================
  // START RECORDING
  // =========================

  const startRecording = async () => {
  const stream = streamRef.current;
  const video = videoRef.current;

  if (!stream) {
    alert("Camera is not available.");
    return;
  }

  if (!video) {
    alert("Camera preview is not available.");
    return;
  }

  try {
    // Make sure the live camera is connected
    video.srcObject = stream;

    // Force live preview visibility
    video.style.display = "block";
    video.style.visibility = "visible";
    video.style.opacity = "1";

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Make sure camera is actually playing
    if (video.paused) {
      await video.play();
    }

    // Wait one frame so browser renders camera
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    let mimeType = "";

    if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
    ) {
      mimeType = "video/webm;codecs=vp9,opus";
    } else if (
      MediaRecorder.isTypeSupported("video/webm")
    ) {
      mimeType = "video/webm";
    }

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const type = mimeType || "video/webm";

      const blob = new Blob(chunksRef.current, {
        type,
      });

      const url = URL.createObjectURL(blob);

      setRecordedBlob(blob);
      setRecordedUrl(url);
    };

    // Start recording
    recorder.start(1000);

    // IMPORTANT:
    // Keep the live camera visible AFTER recording starts
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.style.display = "block";
        videoRef.current.style.visibility = "visible";
        videoRef.current.style.opacity = "1";

        videoRef.current.srcObject = stream;

        videoRef.current.play().catch((error) => {
          console.error("Live preview play error:", error);
        });
      }
    });

    setRecording(true);
    setSeconds(0);

    // Reset teleprompter
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    // Start scrolling
    setScrolling(true);

  } catch (error) {
    console.error("RECORDING ERROR:", error);
    alert("Recording could not be started.");
  }
};
  // =========================
  // STOP RECORDING
  // =========================

  const stopRecording = () => {
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      recorderRef.current.stop();
    }

    setRecording(false);
    setScrolling(false);
  };

  // =========================
  // DOWNLOAD VIDEO
  // =========================

  const downloadVideo = () => {
    if (!recordedBlob || !recordedUrl) return;

    const extension = recordedBlob.type.includes("mp4")
      ? "mp4"
      : "webm";

    const link = document.createElement("a");

    link.href = recordedUrl;
    link.download = `PromptCam-${Date.now()}.${extension}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =========================
  // RECORD AGAIN
  // =========================

  const newRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedUrl(null);
    setRecordedBlob(null);

    setSeconds(0);

    resetScroll();
  };

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // =========================
  // SETUP SCREEN
  // =========================

  if (!cameraOn) {
    return (
      <div className="app">
        <div className="setup-screen">

          <div className="logo">
            <span>◉</span>
            PromptCam
          </div>

          <div className="setup-content">

            <div className="badge">
              TELEPROMPTER CAMERA
            </div>

            <h1>
              Record with confidence.
            </h1>

            <p>
              Paste your complete speech, open the camera,
              and read naturally while PromptCam scrolls
              your script.
            </p>

            <textarea
              value={script}
              onChange={(event) =>
                setScript(event.target.value)
              }
              placeholder="Paste your complete speech or script here..."
            />

            <div className="character-count">
              {script.length} characters
            </div>

            <button
              className="primary-btn"
              onClick={startCamera}
              disabled={!script.trim()}
            >
              Open Camera
            </button>

            {!script.trim() && (
              <p className="small-note">
                Add your script first.
              </p>
            )}

          </div>
        </div>
      </div>
    );
  }

  // =========================
  // CAMERA SCREEN
  // =========================

  return (
    <div className="app">

      <div className="camera-screen">

        {/* LIVE CAMERA */}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera"
        />

        {/* LIGHT GRADIENT */}

        <div className="camera-overlay" />

        {/* TOP BAR */}

        <div className="top-bar">

          <button
            className="close-btn"
            onClick={() => {
              if (recording) {
                stopRecording();
              }

              stopCamera();
              setCameraOn(false);
            }}
          >
            ✕
          </button>

          <div className="brand">
            PromptCam
          </div>

          <div className="timer">

            {recording && (
              <span className="live-dot">
                ●
              </span>
            )}

            {formatTime(seconds)}

          </div>

        </div>

        {/* TELEPROMPTER */}

        <div className="script-overlay">

          <div
            ref={scrollRef}
            className="script-scroll"
          >

            <div className="script-spacer" />

            <div className="script-text">
              {script}
            </div>

            <div className="script-spacer-bottom" />

          </div>

        </div>

        {/* CONTROLS */}

        {!recordedUrl ? (

          <div className="bottom-controls">

            {/* SPEED */}

            <div className="speed-control">

              <span>
                Slow
              </span>

              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(event) =>
                  setSpeed(
                    Number(event.target.value)
                  )
                }
              />

              <span>
                Fast
              </span>

            </div>

            <div className="speed-value">
              {speed.toFixed(1)}×
            </div>

            {/* BUTTONS */}

            <div className="control-row">

              <button
                className="secondary-control"
                onClick={resetScroll}
              >
                ↺
                <span>
                  Reset
                </span>
              </button>

              <button
                className={`record-btn ${
                  recording
                    ? "recording"
                    : ""
                }`}
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
              >
                <span />
              </button>

              <button
                className="secondary-control"
                onClick={() =>
                  setScrolling(
                    (previous) => !previous
                  )
                }
              >
                {scrolling ? "Ⅱ" : "▶"}

                <span>
                  {scrolling
                    ? "Pause"
                    : "Play"}
                </span>

              </button>

            </div>

            <p className="record-label">

              {recording
                ? "Recording • Tap to stop"
                : "Tap to record"}

            </p>

          </div>

        ) : (

          /* RECORDED VIDEO */

          <div className="recorded-panel">

            <h2>
              Recording complete 🎉
            </h2>

            <p>
              Your video is ready.
            </p>

            <video
              src={recordedUrl}
              controls
              playsInline
              className="recorded-video"
            />

            <button
              className="primary-btn save-btn"
              onClick={downloadVideo}
            >
              Save Video
            </button>

            <button
              className="new-btn"
              onClick={newRecording}
            >
              Record Again
            </button>

          </div>

        )}

      </div>
    </div>
  );
}

export default App;