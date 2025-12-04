import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { USER_DETAILS } from "./Constant";
import Websocket from "./../Services/WebSocketService";

const configuration = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCall() {
  const navigate = useNavigate();
  const LOGIN_USER = USER_DETAILS();

  // Refs for mutable values
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteIdRef = useRef(null);
  const candidateBufferRef = useRef([]); // buffer ICE candidates until remoteDesc set
  const unsubRef = useRef(null);

  // DOM video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (LOGIN_USER === false) {
      navigate("/");
      return;
    }

    // get local camera early and keep it
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("getUserMedia error:", err);
      }
    })();

    // subscribe to websocket signaling
    unsubRef.current = Websocket.subscribe((msg) => {
      if (!msg || !msg.code) return;
      // expecting msg shapes: { code, offer, answer, candidate, from, to }
      if (msg.code === "send-offer") {
        handleIncomingOffer(msg);
      } else if (msg.code === "answer-made") {
        handleIncomingAnswer(msg);
      } else if (msg.code === "ice-candidate") {
        handleIncomingIce(msg);
      }
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // create and hook a new RTCPeerConnection (one per call)
  function createPeerConnection(remoteId) {
    // if existing, close it first
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
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
      // attach remote stream
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
    };

    pcRef.current = pc;
    remoteIdRef.current = remoteId;
    return pc;
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

  // Receiver: show button to accept; this function runs when user accepts
  async function callReceive() {
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
      console.log("Answer sent to", fromId);

      // flush buffered remote ICE candidates (if any)
      flushCandidateBuffer();
    } catch (err) {
      console.error("callReceive error:", err);
    }
  }

  // store latest incoming offer in a simple ref so UI can read it
  const lastOfferRef = useRef(null);
  async function handleIncomingOffer(msg) {
    try {
      // msg.offer expected shape: { type, sdp }
      console.log("Incoming offer from", msg.from);
      lastOfferRef.current = msg;
      // show UI accept button — you can manage state to show a modal
      // For this sample, we set remote video id and let user click a button (not implemented here UI-wise)
      // You may call callReceive() automatically or show accept/decline UI.
      // If you want to auto-accept, call callReceive() here.
    } catch (err) {
      console.error("handleIncomingOffer:", err);
    }
  }

  async function handleIncomingAnswer(msg) {
    try {
      console.log("Incoming answer");
      if (!pcRef.current) {
        console.warn("No peer connection to attach answer to");
        return;
      }
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.answer));
      // flush buffered candidates now that remoteDesc is set
      flushCandidateBuffer();
    } catch (err) {
      console.error("handleIncomingAnswer:", err);
    }
  }

  // Add incoming candidate or buffer if remoteDesc not set yet
  async function handleIncomingIce(msg) {
    try {
      if (!msg || typeof msg.candidate === "undefined" || msg.candidate === null) {
        return;
      }
      const candidateInit = msg.candidate; // should be RTCIceCandidateInit
      if (!pcRef.current || !pcRef.current.remoteDescription || pcRef.current.remoteDescription.type === "") {
        // buffer it until pc has remote description
        candidateBufferRef.current.push(candidateInit);
        console.log("Buffered ICE candidate", candidateInit);
        return;
      }
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidateInit));
      console.log("Added remote ICE candidate");
    } catch (err) {
      console.error("handleIncomingIce error:", err);
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

  // helper to return the last stored offer (UI should call this before accepting)
  function remoteOfferRef() {
    return lastOfferRef.current;
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
      lastOfferRef.current = null;
    } catch (e) {
      console.warn("cleanup error", e);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 12 }}>
        <div>
          <div>Local</div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: 240, height: 160, background: "#000" }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div>
          <div>Remote</div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: 320, height: 240, background: "#000" }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => startCall("691d4d8fbc0b6437622b1adb")}>Start Call</button>

        {/* Accept button: only useful when an offer was received */}
        <button
          onClick={() => {
            if (remoteOfferRef()) callReceive();
            else alert("No incoming offer to accept");
          }}
          style={{ marginLeft: 8 }}
        >
          Accept Incoming Call
        </button>
      </div>
    </>
  );
}
