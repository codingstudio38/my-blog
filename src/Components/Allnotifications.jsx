import './../Css/Notifications.css';
import Websocket from "./../Services/WebSocketService";
import React, { useState, useEffect,useRef } from 'react';
import { new_friend_request,cencel_friend_request,accept_friend_request,reject_friend_request,remove_friend } from './Constant.jsx';
export default function Allnotifications(){
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const unsubscribe = Websocket.subscribe((msg) => {
            if(msg?.code==new_friend_request){
                let resert_data = msg.friend_request[0]
                resert_data = {...resert_data,category:new_friend_request,text:`${resert_data.from_user_detail} send to you friend request.`}
                setMessages((prev) => [...prev, resert_data]);
            }
            
        });
        const unsubscribeClose = Websocket.onClose(() => {
            console.error("Disconnected from WS server! Allnotifications.js");
        });
        return () => {
            unsubscribe();
            unsubscribeClose();
        };
    },[]);
    const sendMsg = () => {
    Websocket.send({
      type: "message",
      text: "Hello from Allnotifications.js functional component!",
    });
  };
    return (
        <>
        <div className="container notifications-list">
<div className="profile-container">
        <div className="row row-space-20">
    <div className="col-md-12">
                <div className="tab-content p-0">

                    <div className="tab-pane fade active show" id="profile-friends">
                        <div className="m-b-10"><b className='text-dark'>Notifications ({messages.length})</b></div>

                        <ul className="friend-list clearfix">
                            {messages.map((item, index) => 
                             
    item.category == new_friend_request ? 
        <li key={index}>
            <a href="#">
                <div className="friend-img"><img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="" /></div>
                <div className="friend-info text-left">
                    <h4>{item.from_user_name}</h4>
                    <p>Friend Request</p>
                </div>
            </a>
        </li>
    : item.category == cencel_friend_request  ? 
        <></>
    : item.category == accept_friend_request  ?
        <></>
    : item.category == reject_friend_request  ?
        <></>
    : 
    <></> 
    
                             

                        )
                    }
                            
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