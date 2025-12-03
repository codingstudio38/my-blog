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
    //  if(videoRef.current){
    //   console.log(1,videoRef.current.paused);
    //   if (videoRef.current.paused) {
    //     console.log(11,videoRef.current);
    //     videoRef.current.play();
    //     setIsPaused(false);
    //   } else {
    //     console.log(22,videoRef.current);
    //     videoRef.current.pause();
    //     setIsPaused(true);
    //   }
   }
  return (
    <>
    {playvideo == true ? 
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
        onContextMenu={(e) => e.preventDefault()}
      />
      {/*controlsList="nodownload noplaybackrate"
       disablePictureInPicture*/}
    </div>
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
