import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, USER_DETAILS, USER_LOGOUT } from './Constant';
import { Post_With_Htoken } from './../Services/Https';
import swal from 'sweetalert';
import Websocket from "./../Services/WebSocketService";
let peer = null;
let localStream = null;
let remoteStream = null;
export default function VideoCall() {
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    useEffect(() => {
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
    }, []);
    const [loader, setLoader] = useState(false)

    async function startCall(receiverId) {

    peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = localStream;

    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    peer.onicecandidate = (e) => {
        console.log(e);
        // if (e.candidate) {
        //     socket.send({
        //         action: "ice-candidate",
        //         candidate: e.candidate,
        //         to: receiverId
        //     });
        // }
    };

    peer.ontrack = (e) => {
        remoteVideoRef.current.srcObject = e.streams[0];
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    Websocket.send({
        action: "send-offer",
        offer,
        to: receiverId,
        from: LOGIN_USER._id
    });
}
    return (
        <>
            <button onClick={() => startCall('691d4d8fbc0b6437622b1adb')}>Video Call</button>
            <video ref={localVideoRef} autoPlay muted />
            <video ref={remoteVideoRef} autoPlay />
        </>
    );
}