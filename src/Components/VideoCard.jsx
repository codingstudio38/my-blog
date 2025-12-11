import React, { useState, useEffect,useRef } from 'react';
import { USER_DETAILS, API_URL,decrypt,encrypt,WEBSITE_URL } from './Constant.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import './../Css/VideoCard.css';
export default function VideoCard({ blog }) {
  const LOGIN_USER = USER_DETAILS();
  const [videoUrl, setVideoUrl] = useState(null);
  const [playvideo, setplayvideo] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
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
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    videoRef.current.addEventListener("waiting", onWaiting);
    videoRef.current.addEventListener("playing", onPlaying);
    videoRef.current.addEventListener("canplay", onCanPlay);
    videoRef.current.addEventListener("seeking", onSeeking);
    return () => {
      observer.disconnect();
      if(videoRef.current){
        videoRef.current.removeEventListener("waiting", onWaiting);
        videoRef.current.removeEventListener("playing", onPlaying);
        videoRef.current.removeEventListener("canplay", onCanPlay);
        videoRef.current.removeEventListener("seeking", onSeeking);
      }
    };
  }, [playvideo]);

  async function playVideo() {
    if (playvideo) return;
    setplayvideo(true);
    setIsPaused(false); 
    setIsBuffering(true);
    setTimeout(()=>{
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
      videoRef.current.src = `${API_URL}/video?watch=${idis}`;
    },500)
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
  const volumePercent = volume * 100; 
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  // const seekMax = duration > 0 ? duration : 0.0001;  
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

const [showPreview, setShowPreview] = useState(false);
const [previewImage, setPreviewImage] = useState(null);
const [previewX, setPreviewX] = useState(0);
const [checkThumloading, setcheckThumloading] = useState(false);
const previousSec =  useRef(false);

// const [thumbnailCache, setThumbnailCache] = useState(new Map());
// async function handleHover(e) {
//     if (videoRef==null || duration === 0) return;
   
//     const rect = e.target.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;

//     // const percent = mouseX / rect.width;
//     // const hoverTime = Math.round(percent * duration);
//     // const nearest = Object.keys(thumbnails).reduce((a, b) => Math.abs(b - hoverTime) < Math.abs(a - hoverTime) ? b : a);
//     // const cacheKeys = [...thumbnailCache.keys()].map(Number);
//     // // if (cacheKeys.length === 0) return; // nothing stored in cache yet
//     // const nearest = cacheKeys.reduce((a, b) =>
//     //     Math.abs(b - hoverTime) < Math.abs(a - hoverTime) ? b : a
//     // );
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');
//     const cacheLimit = 50; 
//     const cacheKey = btoa(video.currentTime);
//     setPreviewImage(`${WEBSITE_URL}/images/Loading_2.gif`);
//     setPreviewX(mouseX - 50);  // center preview box
//     setShowPreview(true)
//     if (thumbnailCache.has(cacheKey)) {
//       setPreviewImage(thumbnailCache.get(cacheKey));
//       setPreviewX(mouseX - 50);  // center preview box
//       setShowPreview(true)
//       return true;
//     }
  
//     let dataUrlres= await new Promise((resolve, reject) => {
//         try {
//           context.drawImage(video, 0, 0, canvas.width, canvas.height);
//           const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
//           setThumbnailCache(prev => {
//             const newCache = new Map(prev);
//             newCache.set(cacheKey, dataUrl);
            
//             // Limit cache size
//             if (newCache.size > cacheLimit) {
//               const firstKey = newCache.keys().next().value;
//               newCache.delete(firstKey);
//             }
//             return newCache;
//           });
//           resolve(dataUrl);
//         } catch (error) {
//           console.error("Thumbnail generation error:", error.message);
//           reject(false);
//         }
//     });
//     if(!dataUrlres){
//       setPreviewImage((pew)=>{return dataUrlres;});
//       setPreviewX(mouseX - 50);  // center preview box
//       setShowPreview(true);
//     }
// }
 
 async function handleHover(e) {
        try {
            const rect = e.target.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const percent = mouseX / rect.width;
            const hoverTime = Math.round(percent * duration);
            const current_sec = hoverTime;

            let url = `${API_URL}/video-thumbnail`;
            const idis = encodeURIComponent(encrypt(blog.content_alias));
            let myform = JSON.stringify({watch:idis,sec:current_sec});
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            setShowPreview((pre)=>{
              // console.log(pre);
              return pre;
            })
            // console.log(showPreview);
            if(checkThumloading){
              previousSec.current=e
              console.log('loding..')
              return false;
            }
            // if(!showPreview){}
              // setPreviewImage(`${WEBSITE_URL}/images/Loading_2.gif`);
              // setPreviewX(mouseX - 50);  // center preview box
              // setShowPreview((pre)=>{return true;});
            
 
            setcheckThumloading(true);
            let response = await Post_With_Htoken(myform, url, headers);
            setcheckThumloading(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                if(previousSec.current!==false){ // if previous task pending call again handleHover(e);
                  // setShowPreview((pre)=>{return false;});

                  // setcheckThumloading(true);
                  // setPreviewImage((pre)=>{return data.thumbsbase64});
                  // setPreviewX(mouseX - 50);  // center preview box
                  // setShowPreview((pre)=>{return true;});

                  handleHover(previousSec.current);
                }
                previousSec.current=false;
                // if(!showPreview){}
                  setPreviewImage((pre)=>{return data.thumbsbase64});
                  setPreviewX(mouseX - 50);  // center preview box
                  setShowPreview((pre)=>{return true;});
                
            } else {
                console.error({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
        }
        } catch (error) {
            console.error({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
// function handleHover(e) {

//     const rect = e.target.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;

//     const percent = mouseX / rect.width;
//     const hoverTime = Math.round(percent * duration);
//     const current_sec = hoverTime;
//     // find nearest thumbnail
//     // const nearest = Object.keys(thumbnails)
//     //     .reduce((a, b) => Math.abs(b - hoverTime) < Math.abs(a - hoverTime) ? b : a);

//     setPreviewImage(`${WEBSITE_URL}/images/Loading_2.gif`);
//     setPreviewX(mouseX - 50);  // center preview box
//     setShowPreview(true);
// }

  return (
    <>
    {playvideo == true ? 
    <>
     
    <div className="video-card">
      {isPaused ? (
          <div className="play-btn">►</div>
        ) : (
          <div className="pause-btn hidden">❚❚</div>
        )
      }
      {isBuffering && (
        <div className="video-loading">
          <div className="loading" id="loading">
        <svg width={64} height={64} viewBox="0 0 50 50">
          <circle
            cx={25}
            cy={25}
            r={20}
            fill="none"
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            transform="rotate(-90 25 25)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
        </div>
      )}
      <video
        ref={videoRef}
        // src={videoUrl}
        // controls
        // playsinline preload="metadata"
        // crossOrigin="anonymous"
        autoPlay
        className="video-player"
        poster={blog.thumbnail_view_path == "" ? `${WEBSITE_URL}/images/image-not-found.png`:`${blog.thumbnail_view_path}`}
        controlsList="nodownload"
        onClick={()=>VideoPlayOrPause()}
        onLoadedMetadata={()=>handleMetadata()}
        onTimeUpdate={()=>handleTimeUpdate()}
        onContextMenu={(e) => e.preventDefault()}
      />
      <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }}
      width="160"
      height="90"
    />
      {/*controlsList="nodownload noplaybackrate"
       disablePictureInPicture*/}
      <div className='row video-controllers'>
        <div className='col-md-12'>
          <div className="video-range-wrapper">
            <small className='currentTime'>{formatTime(currentTime)}</small>
            <small className='duration'>{formatTime(duration)}</small>
            <div className="preview-box" style={{ left: previewX, display: showPreview ? 'block' : 'none'}}>
              {
                checkThumloading ? 
                <div className="video-loading">
          <div className="loading">
        <svg width={32} height={32} viewBox="0 0 50 50">
          <circle
            cx={25}
            cy={25}
            r={20}
            fill="none"
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            transform="rotate(-90 25 25)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
        </div>
                
                : <> </>
              }
               <img src={previewImage} alt="preview" />
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime} 
              step="0.1"
              onChange={(e)=>handleSeek(e)}
              // onMouseMove={(e)=>handleHover(e)}
              // onMouseLeave={() => setShowPreview(false)}
              className="video-range"
              aria-label="Seek"
                style={{
                  background: `linear-gradient(to right, rgba(233, 18, 18, 0.85) ${progressPercent}%, #e6e6e6 ${progressPercent}%)`,
                }}
            />
          </div>
        </div>
        <div className='col-md-12'>
          <div className="d-flex justify-content-between align-items-center">
            <div className='right d-flex align-items-center'>
          { isPaused==true ?
            <button type='button' className='btn btn-sm btn-primary Playbtn' onClick={()=>Play()} ><i className="bi bi-play-fill"></i></button>
            : 
            <button type='button' className='btn btn-sm btn-warning Pausebtn' onClick={()=>Pause()} ><i className="bi bi-pause-fill"></i></button>
          }
          { isMuted==true ?
                <>
                  <button type='button' className='btn btn-sm btn-info ms-1 Unmutebtn' onClick={()=>Unmute()} >
                    <i className="bi bi-volume-mute-fill"></i>
                    </button>
                </> 
                : 
                <>
                  <button type='button' className='btn btn-sm btn-info ms-1 Mutebtn' onClick={()=>Mute()} >
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
                  style={{
                  background: `linear-gradient(to right, rgba(233, 18, 18, 0.85) ${volumePercent}%, #e6e6e6 ${volumePercent}%)`,
                }}
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
                className="btn btn-sm btn-dark ms-2 togglePIP"
                onClick={togglePIP}
              >
                <i className="bi bi-box-arrow-up-right"></i>
              </button>
              <button
                className="btn btn-sm btn-dark ms-2 toggleFullscreen"
                onClick={toggleFullscreen}
              >
                <i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}></i>
              </button>
            </div>
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
