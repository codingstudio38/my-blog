import React, { useState, useEffect,useRef } from 'react';
import { USER_DETAILS, API_URL,decrypt,encrypt,WEBSITE_URL } from './Constant.jsx';
import './../Css/VideoCard.css';
export default function VideoCard({ blog }) {
  const LOGIN_USER = USER_DETAILS();
  const [videoUrl, setVideoUrl] = useState(null);
  const [playvideo, setplayvideo] = useState(false);
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(true);
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // out of view → pause
            videoRef.current.pause();
            setIsPaused(true);
          }
        });
      },
      {
        threshold: 0.25, // video must be at least 25% visible
      }
    );

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, [playvideo]);

  async function playVideo() {
    if (playvideo) return;
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
    setplayvideo(true);
    setIsPaused(false); 
   }


   function VideoPlayOrPause(){

    if (videoRef.current) {
          if(videoRef.current.paused){
             setIsPaused((pre)=>{return false;});
            videoRef.current.play();
          } else {
            setIsPaused((pre)=>{return true;});
            videoRef.current.pause();
          }
      }

    // Toggle play/pause if video controller enable
    // if(videoRef.current){
    // const video = videoRef.current;
    //   video.addEventListener("play", (e)=>{
    //     setIsPaused(false);
    //   });
    //   video.addEventListener("pause",  (e)=>{
    //     setIsPaused(true);
    //   });
    // }

   }
    function Play(){
      if (videoRef.current) {
        setIsPaused(false);
        videoRef.current.play();
      }
    }
    function Pause(){
      if (videoRef.current) {
        setIsPaused(true);
        videoRef.current.pause();
      }
    }
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    function Mute(){
      if (videoRef.current) {
        // videoRef.current.muted = !videoRef.current.muted;  
        videoRef.current.muted = true;  
        setIsMuted(true);
        setVolume(0);
        videoRef.current.volume =0;
      }
    }
    function Unmute(){
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setVolume(1);
        videoRef.current.volume =1;
      }
    }
    function handleMetadata() {
  if (videoRef.current) {
    setDuration(videoRef.current.duration);  // total duration in seconds
  }
}

function handleTimeUpdate() {
  if (videoRef.current) {
    setCurrentTime(videoRef.current.currentTime);  // current position
  }
}
function formatTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const h = hours < 10 ? '0' + hours : hours;
  const m = minutes < 10 ? '0' + minutes : minutes;
  const s = seconds < 10 ? '0' + seconds : seconds;

  return `${h}:${m}:${s}`;
}
function handleSeek(e) {
  const value = e.target.value;
  videoRef.current.currentTime = value;
  setCurrentTime(value);
}
function handleVolumeChange(e) {
  const vol = parseFloat(e.target.value);
  setVolume(vol);
  if (videoRef.current) {
    videoRef.current.volume = vol;
  }
  if(vol <= 0){
    setIsMuted(true);
  } else {
    setIsMuted(false);
  }
}
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const seekMax = duration > 0 ? duration : 0.0001;  
  function changeSpeed(value) {
  const speed = parseFloat(value);
  setPlaybackRate(speed);
  if (videoRef.current) {
    videoRef.current.playbackRate = speed;
  }
}
async function togglePIP() {
  if (!videoRef.current) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoRef.current.requestPictureInPicture();
    }
  } catch (err) {
    console.log("PIP error:", err);
  }
}
function toggleFullscreen() {
  const videoContainer = videoRef.current.parentElement;

  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
      videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.msRequestFullscreen) {
      videoContainer.msRequestFullscreen();
    }
    setIsFullscreen(true);
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  }
}
  return (
    <>
    {playvideo == true ? 
    <>
    <div className="video-card" onClick={VideoPlayOrPause}>
      {isPaused ? (
          <div className="play-btn">►</div>
        ) : (
          <div className="pause-btn hidden">❚❚</div>
        )
      }
      <video
        ref={videoRef}
        src={videoUrl}
        // controls
        autoPlay
        className="video-player"
        poster={blog.thumbnail_view_path == "" ? `${WEBSITE_URL}/images/image-not-found.png`:`${blog.thumbnail_view_path}`}
        controlsList="nodownload"
        onLoadedMetadata={handleMetadata}
        onTimeUpdate={handleTimeUpdate}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/*controlsList="nodownload noplaybackrate"
       disablePictureInPicture*/}
       
    </div>
    <div className='row video-controllers'>
      <div className='col-md-12'>
        <div className="video-range-wrapper">
          <small className='currentTime'>{formatTime(currentTime)}</small>
          <small className='duration'>{formatTime(duration)}</small>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            step="0.1"
            onChange={handleSeek}
            className="video-range"
            aria-label="Seek"
              style={{
                background: `linear-gradient(to right, rgba(13,110,253,0.85) ${progressPercent}%, #e6e6e6 ${progressPercent}%)`,
              }}
          />
        </div>
      </div>
      <div className='col-md-12'>
        <div className="d-flex justify-content-between align-items-center">
          <div className='right d-flex align-items-center'>
        { isPaused==true ?
          <button type='button' className='btn btn-sm btn-primary' onClick={()=>Play()} ><i className="bi bi-play-fill"></i></button>
          : 
          <button type='button' className='btn btn-sm btn-warning' onClick={()=>Pause()} ><i className="bi bi-pause-fill"></i></button>
        }
        { isMuted==true ?
              <>
                <button type='button' className='btn btn-sm btn-info ms-1' onClick={()=>Unmute()} >
                  <i className="bi bi-volume-mute-fill"></i>
                  </button>
              </> 
              : 
              <>
                <button type='button' className='btn btn-sm btn-info ms-1' onClick={()=>Mute()} >
                  <i className={`bi ${
                    volume == 0
                      ? "bi-volume-mute-fill"
                      : volume < 0.5
                      ? "bi-volume-down-fill"
                      : "bi-volume-up-fill"
                  }`}></i>
                  </button>
              </>
            }
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-range ms-1"
            />
          </div>
          <div className='left d-flex align-items-center'>
            <select
              className="speed-select"
              value={playbackRate}
              onChange={(e) => changeSpeed(e.target.value)}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
            <button
              className="btn btn-sm btn-dark ms-2"
              onClick={togglePIP}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </button>
            <button
              className="btn btn-sm btn-dark ms-2"
              onClick={toggleFullscreen}
            >
              <i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}></i>
            </button>
          </div>
        </div>
    
      </div>
    </div>
    </>
    :
     <div className="video-card" onClick={playVideo}>
      {isPaused ? (
          <div className="play-btn">►</div>
        ) : (
          <div className="pause-btn">❚❚</div>
        )
      }
      {
        blog.thumbnail_view_path == "" ? 
          <img src={`${WEBSITE_URL}/images/image-not-found.png`} className="thumbnail-image" title={blog.title} loading="lazy"/>
        :  
          <img src={blog.thumbnail_view_path} className="thumbnail-image" title={blog.title} loading="lazy"/>
      }
    </div>
    }
    </>
  );
}
