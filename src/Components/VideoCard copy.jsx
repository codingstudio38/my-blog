import React, { useState, useEffect, useRef } from "react";
import {
  USER_DETAILS,
  API_URL,
  decrypt,
  encrypt,
  WEBSITE_URL,
} from "./Constant.jsx";
import "./../Css/VideoCard.css";

export default function VideoCard({ blog }) {
  const LOGIN_USER = USER_DETAILS();
  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [playvideo, setPlayvideo] = useState(false);

  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1); // 0..1

  // play the video when videoUrl / playvideo becomes true
  useEffect(() => {
    if (playvideo && videoRef.current) {
      // try to play (some browsers require user gesture)
      videoRef.current.play().catch(() => {
        // ignore play rejection (autoplay policy)
      });
    }
  }, [playvideo, videoUrl]);

  // IntersectionObserver: pause when out of view
  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  // Track native play/pause events to keep state in sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [videoRef.current]);

  // Load video URL and start playing when thumbnail clicked
  async function playVideo() {
    if (playvideo) {
      // already loaded — toggle play
      togglePlayPause();
      return;
    }
    const idis = encodeURIComponent(encrypt(blog.content_alias));
    // let response = await fetch(`${API_URL}/video-player?watch=${idis}`, {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${LOGIN_USER.token}`,
    //     Range: "bytes=0-"
    //   }
    // });
    // const blob = await response.blob();
    // const url = URL.createObjectURL(blob);
    // setVideoUrl(url);
    setVideoUrl(`${API_URL}/video?watch=${idis}`);
    setPlayvideo(true);
    setIsPaused(false)
  }

  function togglePlayPause() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  function Play() {
    if (!videoRef.current) return;
    videoRef.current.play();
  }
  function Pause() {
    if (!videoRef.current) return;
    videoRef.current.pause();
  }

  function toggleMute() {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      setVolume(0);
    } else {
      // restore to last non-zero volume or default to 1
      const restored = videoRef.current.volume > 0 ? videoRef.current.volume : 1;
      setVolume(restored);
      videoRef.current.volume = restored;
    }
  }

  function handleMetadata() {
    if (!videoRef.current) return;
    const d = videoRef.current.duration || 0;
    setDuration(Number.isFinite(d) ? d : 0);
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime || 0);
  }

  function formatTime(time) {
    if (!time || !isFinite(time)) return "00:00:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const h = hours < 10 ? "0" + hours : hours;
    const m = minutes < 10 ? "0" + minutes : minutes;
    const s = seconds < 10 ? "0" + seconds : seconds;

    return `${h}:${m}:${s}`;
  }

  function handleSeek(e) {
    const v = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = v;
    setCurrentTime(v);
  }

  function handleVolumeChange(e) {
    const vol = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = vol;
    videoRef.current.muted = vol === 0;
    setVolume(vol);
    setIsMuted(vol === 0);
  }

  // progress fill percentage for custom styling
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const seekMax = duration > 0 ? duration : 0.0001; // avoid zero max in some browsers

  const poster =
    blog.thumbnail_view_path && blog.thumbnail_view_path !== ""
      ? blog.thumbnail_view_path
      : `${WEBSITE_URL}/images/image-not-found.png`;

  return (
    <div className="vc-container">
      {!playvideo ? (
        <div className="vc-thumb" onClick={playVideo} role="button" tabIndex={0}>
          <img
            src={poster}
            alt={blog.title}
            className="vc-thumb-img"
            loading="lazy"
          />
          <div className="vc-overlay">
            <div className="vc-overlay-play">►</div>
          </div>
        </div>
      ) : (
        <div className="vc-player">
          <div className="vc-video-wrap" onClick={togglePlayPause}>
            <video
              ref={videoRef}
              src={videoUrl}
              className="vc-video"
              poster={poster}
              onLoadedMetadata={handleMetadata}
              onTimeUpdate={handleTimeUpdate}
              onContextMenu={(e) => e.preventDefault()}
              controls={false}
            />
            <div className={`vc-center-play ${isPaused ? "visible" : ""}`}>
              {isPaused ? "►" : "❚❚"}
            </div>
          </div>

          {/* Glass control bar */}
          <div className="vc-controls glass">
            <div className="vc-left">
              {/* Play / Pause */}
              {isPaused ? (
                <button className="vc-btn" onClick={Play} aria-label="Play">
                  <i className="bi bi-play-fill"></i>
                </button>
              ) : (
                <button className="vc-btn" onClick={Pause} aria-label="Pause">
                  <i className="bi bi-pause-fill"></i>
                </button>
              )}
              {/* Time */}
              <div className="vc-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Seek bar */}
            <div className="vc-seek-wrap">
              <input
                className="vc-seek"
                type="range"
                min="0"
                max={seekMax}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek"
                style={{
                  background: `linear-gradient(to right, rgba(13,110,253,0.85) ${progressPercent}%, #e6e6e6 ${progressPercent}%)`,
                }}
              />
            </div>

            <div className="vc-right">
              {/* Volume */}
              <div className="vc-volume">
                <button
                  className="vc-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  <i
                    className={`bi ${volume === 0
                        ? "bi-volume-mute-fill"
                        : volume < 0.5
                          ? "bi-volume-down-fill"
                          : "bi-volume-up-fill"
                      }`}
                  ></i>
                </button>

                <input
                  className="vc-volume-range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                />
              </div>

              {/* Extra buttons if needed */}
              <button className="vc-btn" onClick={() => { }}>
                <i className="bi bi-gear-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
