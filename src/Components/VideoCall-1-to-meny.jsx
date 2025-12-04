import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, USER_DETAILS, USER_LOGOUT,WEBSITE_URL } from './Constant';
import { Post_With_Htoken } from '../Services/Https';
import swal from 'sweetalert';
import Websocket from "../Services/WebSocketService";
 import './../Css/VideoCall.css';
var configuration = {
            iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
            iceCandidatePoolSize: 10,
        };
export default function VideoCall() {
    const firstCall = useRef(true);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [clloffer, setclloffer] = useState(false);
    const [showreceivebtn, setshowreceivebtn] = useState(false);
    // const [answermade, setanswermade] = useState(false);
    // const [icecandidate, seticecandidate] = useState(false);
    const cllofferRef = useRef(null);
    const showreceivebtnRef = useRef(false);
    // const answermadeRef = useRef(false);
    // const icecandidateRef = useRef(false);
    const unsubRef = useRef(null);
    const pcRef = useRef(new Map());
    const remoteIdRef = useRef(null);
    const localStreamRef = useRef(null);
  const candidateBufferRef = useRef([]); // buffer ICE candidates until remoteDesc set
    useEffect(() => {
        if (LOGIN_USER === false) {
        navigate('/');
        return;
    }
        if (firstCall.current) {
            firstCall.current = false;
            return;
        }
        cllofferRef.current = false;
        showreceivebtnRef.current = false;
        // answermadeRef.current = false;
        // icecandidateRef.current = false;
            unsubRef.current = Websocket.subscribe((msg) => {
                    if(msg?.code=='send-offer'){
                        cllofferRef.current = msg;
                        setclloffer((pre)=>{return cllofferRef.current;});
                        handleIncomingOffer(msg);
                        // console.log('VideoCall.jsx/////////send-offer',msg);
                    } else if(msg?.code=='answer-made'){
                        // answermadeRef.current = msg;
                        // setanswermade((pre)=>{return answermadeRef.current;});
                        handleIncomingAnswer(msg);
                        // console.log('VideoCall.jsx/////////answer-made',msg);
                    } else if(msg?.code=='ice-candidate'){
                        // icecandidateRef.current = msg;
                        // seticecandidate((pre)=>{return icecandidateRef.current;});
                        handleIncomingIce(msg);
                        // console.log('VideoCall.jsx/////////ice-candidate',msg);
                    }
            });
            return () => {
                if (unsubRef.current) unsubRef.current();
                    cleanup();
            };
        }, []);
 
  // create and hook a new RTCPeerConnection (one per call)
  function createPeerConnection(remoteId) {
    if (pcRef.current.has(remoteId)) {
      return pcRef.current.get(remoteId);
    }
    // if existing, close it first
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = new Map();
      candidateBufferRef.current = [];
    }

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (e) => {
      // send only the candidate (serializable)
      if (e.candidate) {
        Websocket.send({
          code: "ice-candidate",
          candidate: e.candidate, // RTCIceCandidateInit
          from: LOGIN_USER._id,
          to: remoteId,
        });
      } else {
        // sometimes browsers fire a null candidate when gathering finished — not required to send
        // If you want, you can send an explicit "end-of-candidates" signal.
      }
    };

    pc.ontrack = (ev) => {
      attachRemoteVideo(remoteId, ev.streams[0]);
    };
    pcRef.current.set(remoteId, pc);
    return pc;
    
    // pc.ontrack = (ev) => {
    //   // console.log('ev',ev)
    //   // attach remote stream
    //   if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
    // };

    // pcRef.current = pc;
    // remoteIdRef.current = remoteId;
    // return pc;

  }
  function attachRemoteVideo(remoteId, stream) {
  let video = document.getElementById(`remoteVideoRef${remoteId}`);
  if (!video) {
    video = document.createElement("video");
    video.id = `remoteVideoRef${remoteId}`;
    video.autoplay = true;
    video.controls = true;
    document.getElementById("remoteVideos").appendChild(video);
  }
  video.srcObject = stream;
}
async function startCall(receiverId) {
    try {
      // ensure local stream available
      if (!localStreamRef.current) {
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = s;
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      }

      const pc = createPeerConnection(receiverId);

      // add local tracks
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));

      // create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // send serializable offer (it has { type, sdp })
      Websocket.send({
        code: "send-offer",
        offer: pc.localDescription, // { type, sdp }
        from: LOGIN_USER._id,
        to: receiverId,
      });
      console.log("Offer sent to", receiverId);
    } catch (err) {
      console.error("startCall error:", err);
    }
    
}
 
async function handleIncomingOffer(msg){
    try {
        cllofferRef.current = msg;
        showreceivebtnRef.current = true;
        setshowreceivebtn((pre)=>{return true;});
    } catch (error) {
        console.error(error)
    }
}

function remoteOfferRef() {
    return cllofferRef.current;
  }
async function callreceive(){
    try {
      const offerMsg = remoteOfferRef(); // helper to get stored offer (see note below)
      if (!offerMsg) {
        console.error("No offer available to accept");
        return;
      }
      const fromId = offerMsg.from;

      // ensure local stream ready
      if (!localStreamRef.current) {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }

      const pc = createPeerConnection(fromId);

      // add local tracks
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));

      // set remote description using proper RTCSessionDescriptionInit
      await pc.setRemoteDescription(new RTCSessionDescription(offerMsg.offer));

      // create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send answer
      Websocket.send({
        code: "answer-made",
        answer: pc.localDescription,
        from: LOGIN_USER._id,
        to: fromId,
      });
      // console.log("Answer sent to", fromId);

      // flush buffered remote ICE candidates (if any)
      flushCandidateBuffer();
    } catch (err) {
      console.error("callReceive error:", err);
    }
}

async function handleIncomingAnswer(msg){
    try {
         console.log("Incoming answer");
      if (!pcRef.current) {
        console.warn("No peer connection to attach answer to");
        return;
      }
      const pc = pcRef.current.get(msg.from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
      // flush buffered candidates now that remoteDesc is set
      flushCandidateBuffer();
    } catch (e) {
        console.log('error handleIncomingAnswer',e);
    }
}
async function handleIncomingIce(msg){
     try {
     if (!msg || typeof msg.candidate === "undefined" || msg.candidate === null) {
        return;
      }
      const candidateInit = msg.candidate; // should be RTCIceCandidateInit
      if (!pcRef.current || !pcRef.current.remoteDescription || pcRef.current.remoteDescription.type === "") {
        // buffer it until pc has remote description
        candidateBufferRef.current.push(candidateInit);
        console.log("Buffered ICE candidate");//, candidateInit 
        return;
      }
      const pc = pcRef.current.get(msg.from);
      if (!pc) return;
      await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));

      console.log("Added remote ICE candidate");
    
  } catch (e) {
    console.log('error -> handleIncomingIce',e);
  }
}
 function flushCandidateBuffer() {
    if (!pcRef.current) return;
    const buf = candidateBufferRef.current.splice(0);
    buf.forEach(async (c) => {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        console.log("Flushed buffered candidate");
      } catch (e) {
        console.warn("Error adding buffered candidate", e);
      }
    });
  }
  function cleanup() {
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      candidateBufferRef.current = [];
      cllofferRef.current = null;
    } catch (e) {
      console.warn("cleanup error", e);
    }
  }
    return (
        <>
        <div className='row video-call'>
          <div className='col-md-12 video-card' id='remoteVideos'>
             {/* ref={remoteVideoRef}  */}
             {/* <video
             id='remoteVideoRef' 
             autoPlay controls
             poster={`${WEBSITE_URL}/images/image-not-found.png`}
             onContextMenu={(e) => e.preventDefault()}/> */}
          </div>
          <div className='col-md-3'>
             <button onClick={() => startCall('691dd5a69a33be0cc9c93c15')}>First User Video Call</button>
             <button onClick={() => startCall('690b4d76579e83f61ae3ed70')}>Second User Video Call</button>
          </div>
          <div className='col-md-3'>
            {
                showreceivebtn==true ? <button onClick={callreceive}>Receive Video Call</button> : <></>
            }
          </div>
          <div className='col-md-3'>

          </div>
          <div className='col-md-3 local-video-card'>
            <video ref={localVideoRef} id='localVideoRef'
             autoPlay 
             controls 
             poster={`${WEBSITE_URL}/images/image-not-found.png`} 
             onContextMenu={(e) => e.preventDefault()}/>
          </div>
        </div>
           
        </>
    );
}