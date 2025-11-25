import { w3cwebsocket as W3CWebSocket } from "websocket";
import { WS_URL , USER_DETAILS } from './../Components/Constant'
let socket = null;
let listeners = [];
let closeListeners = [];
let isConnected = false;
let reconnectIn = 0;
let isManualClose = false;
let reconnectTimer = null;
const connect = () => {
    const LOGIN_USER = USER_DETAILS();
  if (socket && socket.readyState === 1) {
    console.log("WebSocket already connected");
    return;
  }
 
  socket = new W3CWebSocket(`${WS_URL}?Authorization=${LOGIN_USER._id ? LOGIN_USER._id : ""}`);
  isManualClose = false;
  socket.onopen = () => {
    isConnected = true;
    reconnectIn = 0;
    clearTimeout(reconnectTimer);
    console.log("WebSocket connected");
  };
  socket.onclose = () => {
    closeListeners.forEach((cb) => cb());
    console.log("WebSocket disconnected..");
    isConnected = false;
    if (!isManualClose) {
      if (!isConnected) {
          reconnectTimer = setTimeout(connect(), 1000);
          reconnectIn++;
          console.warn('echo-protocol Client Closed! Trying to reconnect in '+reconnectIn+` sec.`, );
          // if (isConnected) {
          //     connect();
          // }
      }
    }
  };
  socket.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      listeners.forEach((cb) => cb(data));
    } catch (e) {
      console.error("Invalid JSON");
    }
  };
};
 
const send = (data) => {
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("WebSocket not connected");
  }
};
 
const subscribe = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
  };
};
 
const onClose = (callback) => {
  closeListeners.push(callback);
  return () => {
    closeListeners = closeListeners.filter((fn) => fn !== callback);
  };
};
 
const disconnect = () => {
  isManualClose = true;
  reconnectIn=0;
  clearTimeout(reconnectTimer);
  socket.close();
  socket = null;
};
export default {
  connect,
  send,
  subscribe,
  onClose,
  disconnect
};