import './../Css/Userslist.css';
import Websocket from "./../Services/WebSocketService";
import React, { useState, useEffect,useRef } from 'react';
export default function Userslist(){
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const unsubscribe = Websocket.subscribe((msg) => {
            console.log("Received message in Chatlistnew: from Chatlistnew.js", msg);
            setMessages((prev) => [...prev, msg]);
        });
        const unsubscribeClose = Websocket.onClose(() => {
            console.error("Disconnected from WS server! Chatlistnew.js");
        });
        return () => {
            unsubscribe();
            unsubscribeClose();
        };
    },[]);
    const sendMsg = () => {
    Websocket.send({
      type: "message",
      text: "Hello from Chatlistnew.js functional component!",
    });
  };
    return (
        <>
        <div className="container user-list">
<div className="profile-container">
        <div className="row row-space-20">
    <div className="col-md-12">
                <div className="tab-content p-0">

                    <div className="tab-pane fade active show" id="profile-friends">
                        <div className="m-b-10"><b className='text-dark'>Friend List (9)</b></div>

                        <ul className="friend-list clearfix">
                            <li>
                                <a href="#">
                                    <div className="friend-img"><img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="" /></div>
                                    <div className="friend-info text-left">
                                        <h4>Sancho Aldo</h4>
                                        <p>392 friends</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <div className="friend-img"><img src="https://bootdey.com/img/Content/avatar/avatar3.png" alt="" /></div>
                                    <div className="friend-info text-left">
                                        <h4>Jonty Augusto</h4>
                                        <p>128 friends</p>
                                    </div>
                                </a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </div>
  </div>
</div>
</div>
        </>
    )
}