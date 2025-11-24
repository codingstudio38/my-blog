import './../Css/Userslist.css';
import Websocket from "./../Services/WebSocketService";
import { USER_DETAILS, API_URL,USER_LOGOUT } from './Constant.jsx';
 import { Post_With_Htoken } from '../Services/Https.jsx';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import swal from 'sweetalert';
export default function Userslist(){
     const firstCall = useRef(true);
    const [messages, setMessages] = useState([]);
    const LOGIN_USER = USER_DETAILS();
    const [total_rec, settotal_rec] = useState(0);
 
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(12);
    const [total_friend_rec, settotal_friend_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    let [search_name, setsearch_name] = useState('');
    useEffect(() => {
        if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            MyFriends();
        const unsubscribe = Websocket.subscribe((msg) => {
            console.log("Received message in Userslist: from Userslist.js", msg);
            setMessages((prev) => [...prev, msg]);
        });
        // const unsubscribeClose = Websocket.onClose(() => {
        //     console.error("Disconnected from WS server! Userslist.js");
        // });
        return () => {
            unsubscribe();
            // unsubscribeClose();
        };
    },[]);
    const sendMsg = () => {
    Websocket.send({
      type: "message",
      text: "Hello from Userslist.js functional component!",
    });
  };
   async function MyFriends() {
          try {
              if (listloader) {
                  return false;
              }
              setlistloader(true);
              setTimeout(async ()=>{
                  let url = `${API_URL}/my-friends?page=${currentpage}&limit=${limit}`;
                  let myform = JSON.stringify({user_id:LOGIN_USER._id,name:search_name});
                  let headers = {
                      'Content-Type': 'application/json',
                      'authorization': `Bearer ${LOGIN_USER.token}`,
                  };
                  let response = await Post_With_Htoken(myform, url, headers);
                  setlistloader(false);
                  if(response!==""){
                      response = await response.json();
                      const data = response;
                      if (data.status == 200) {
                        //   console.log(data);
                          setDatelist((prev) => [...prev, ...data.result.list]);
                          settotal_friend_rec((dataid) => { return data.result.total });
                          setlastpage((dataid) => { return data.result.lastpage });
                      } else {
                          swal({
                              title: `${data?.message}`,
                              icon: "warning",
                          })
                      }
                  }
                },1000);
          } catch (error) {
              setlistloader(false);
              swal({
                  title: `Unknow error:- ${error.message}`,
                  icon: "error",
              })
          }
      }
    return ( 
        <>
        <div className="container user-list">
<div className="profile-container">
        <div className="row row-space-20">
    <div className="col-md-12">
                <div className="tab-content p-0">

                    <div className="tab-pane fade active show" id="profile-friends">
                        <div className="m-b-10"><b className='text-dark'>My Friend List ({total_friend_rec})</b></div>

                        <ul className="friend-list clearfix">

                             {datalist.map((item, index) => 
                <li key={index}>
                                <a href="#">
                                    <div className="friend-img">
                                         {
                                            item.user_file_dtl.filename == "" ? 
                                            <><img src='/images/image-not-found.png' title={item.name}  alt={item.name} loading="lazy"/></>
                                                :  
                                            <><img src={item.user_file_dtl.file_view_path} title={item.name}  alt={item.name} loading="lazy"/></>
                                        }
                                    </div>
                                    <div className="friend-info text-left">
                                        <h4>{item.name}</h4>
                                        <p>{item.total_friend} friends  </p>
                                        {item.wsstatus ==1 ?
                                        <><small className='text-success'>Online</small></> 
                                        :
                                        <><small className='text-danger'>Offline</small></>
                                        }
                                        
                                    </div>
                                </a>
                            </li>
                )}
                            
                        </ul>
                        {listloader==true ? <>
                        <div className='text-center not-loader'>
                            <div className="spinner-grow text-primary" role="status">
                            <span className="sr-only"></span>
                            </div>
                        </div>
                        </> :
                        <>
                        <div className='mt-1 text-center'>
                            <button type='button' className='btn btn-sm btn-success'>Load more.</button>
                        </div>
                        </>
                        }
                    </div>
                </div>
            </div>
  </div>
</div>
</div>
        </>
    )
}