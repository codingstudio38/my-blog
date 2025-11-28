import React, { useState, useEffect,useRef } from 'react';
import { USER_DETAILS, API_URL,decrypt,encrypt,WEBSITE_URL } from './Constant.jsx';

export default function VideoCard({ blog }) {
  const LOGIN_USER = USER_DETAILS();
  const [videoUrl, setVideoUrl] = useState(null);
  const [playvideo, setplayvideo] = useState(false);
  const videoRef = useRef(null);

  // Auto-pause when video is out of view
 // Auto pause when video leaves screen
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // out of view → pause
            videoRef.current.pause();
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
    // let response = await fetch(`${API_URL}/video?watch=${idis}`, {
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
  }

  return (
    <div className="video-card" onClick={playVideo}>
      {
      playvideo==true ? 
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          className="video-player"
          poster={
                blog.thumbnail_view_path == "" ? `${WEBSITE_URL}/images/image-not-found.png`
                    :
                    `${blog.thumbnail_view_path}`
            }
        />
      : 
       blog.thumbnail_view_path == "" ? 
    <img src={`${WEBSITE_URL}/images/image-not-found.png`} className="thumbnail-image" title={blog.title} loading="lazy"/>
        :  
    <img src={blog.thumbnail_view_path} className="thumbnail-image" title={blog.title} loading="lazy"/>
      
      }
    </div>
  );
}
