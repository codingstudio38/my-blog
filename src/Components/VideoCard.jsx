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
    // Toggle play/pause
    if(videoRef.current){
    const video = videoRef.current;
      video.addEventListener("play", (e)=>{
        setIsPaused(false);
      });
      video.addEventListener("pause",  (e)=>{
        setIsPaused(true);
      });
    }
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
  return (
    <>
    {playvideo == true ? 
    <>
    <small>{formatTime(currentTime)}/{formatTime(duration)}</small>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        step="0.1"
        onChange={handleSeek}
        className="video-range"
      />
    {
      isPaused==true ?
       <>
       <button type='button' className='btn btn-sm btn-primary' onClick={()=>Play()} id='button-play'><i className="bi bi-play-fill"></i></button>
       </> 
      : 
      <>
      <button type='button' className='btn btn-sm btn-warning' onClick={()=>Pause()} id='button-pause'><i className="bi bi-pause-fill"></i></button>
        { isMuted==true ?
          <>
            <button type='button' className='btn btn-sm btn-info ms-1' onClick={()=>Unmute()} id='button-Unmute'>
              <i className="bi bi-volume-mute-fill"></i>
              </button>
          </> 
          : 
          <>
            <button type='button' className='btn btn-sm btn-info ms-1' onClick={()=>Mute()} id='button-mute'>
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
            className="volume-range"
        />
      </>
    }
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
        controls
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
