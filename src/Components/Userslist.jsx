import './../Css/Userslist.css';
import Websocket from "./../Services/WebSocketService";
 
import { accept_friend_request,remove_friend,USER_DETAILS, API_URL,USER_LOGOUT,new_client,client_disconnected,subscribe_auto_reload_friendlist,new_chat_message,subscribe_FindUserById,user_is_typing} from './Constant.jsx';
 import { Post_With_Htoken } from '../Services/Https.jsx';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,Link,useLocation  } from 'react-router-dom';
import swal from 'sweetalert';
import $ from 'jquery';
export default function Userslist(props){
    const location = useLocation();
    const navigate = useNavigate();
     const firstCall = useRef(true);
     const firstCallN = useRef(true);
    const [messages, setMessages] = useState([]);
    const LOGIN_USER = USER_DETAILS();
 
 
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(10);
    const [total_friend_rec, settotal_friend_rec] = useState(0);
    let [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    let [search_name, setsearch_name] = useState('');
    let [auto_reload_in, setauto_reload_in] = useState(3);
    let [show_auto_reload_in, setshow_auto_reload_in] = useState(false);
    let [auto_reloadsetInterval, setauto_reloadsetInterval] = useState(null);
    let [disabled_loadermore_btn, setdisabled_loadermore_btn] = useState(false);
    useEffect(() => {
        if (firstCall.current) {
                firstCall.current = false;
                return;
            } 
            subscribe_auto_reload_friendlist(auto_reload_inFn);
        const unsubscribe = Websocket.subscribe((msg) => {
            if(msg?.code==remove_friend){
                let resert_data = msg.result;
                remove_friend_from_lisr(resert_data);
            } else if(msg?.code==accept_friend_request){
                auto_reload_inFn();
            } else if(msg?.code==new_client){
                let resert_data = msg.result;
                userconnection(resert_data,new_client);
            }else if(msg?.code==client_disconnected){
                let resert_data = msg.result;
                userconnection(resert_data,client_disconnected);
            }else if (msg?.code == new_chat_message) {
                let resert_data = msg.chat
                getNewmessage(resert_data)
            }else if (msg?.code == user_is_typing) {
                handleUserTyping(msg);
            }
        });
        // const unsubscribeClose = Websocket.onClose(() => {
        //     console.error("Disconnected from WS server! Userslist.js");
        // });
        return () => {
            unsubscribe();
            // unsubscribeClose();
        };
    },[]);
    useEffect(() => {
        if (firstCallN.current) {
                firstCallN.current = false;
                return;
            } 
            MyFriends();
    },[currentpage]);
    const sendMsg = () => {
    Websocket.send({
      type: "message",
      text: "Hello from Userslist.js functional component!",
    });
  };
  function getNewmessage(row) {
    setDatelist((prev) => {
         let newdatalist = prev.map(item => {
            if (item._id === row.from_user) {
                return {
                    ...item,
                    total_unread_message:item.total_unread_message+1,
                };
            }
            return item;
        });
        newdatalist.sort((a, b) => b.total_unread_message - a.total_unread_message);
        return newdatalist;
    });
    }
 function userconnection(user,status){
    setDatelist((prev) => {
         let newdatalist = prev.map(item => {
            if (item._id === user) {
                return {
                    ...item,
                    wsstatus:status==1000 ? 1 : 0,
                };
            }
            return item;
        });
        return newdatalist;
    });
  }
  function remove_friend_from_lisr(row){
    setDatelist((prev) => {
         let newdatalist = prev.filter(item => {
            if(item._id == row.to){
                return false;
            } else if(item._id == row.from){
                return false;
            } else {
                return true;
            }
        });
        return newdatalist;
    });
    settotal_friend_rec((pre)=>{return pre-1});
  }
  
function auto_reload_inFn() {
    if (auto_reloadsetInterval) {
        clearInterval(auto_reloadsetInterval);
    }
    if (!show_auto_reload_in) {
        setshow_auto_reload_in(true);
    }
    const interval = setInterval(() => {
        setauto_reload_in((prev) => {
            if (prev === 0) {
                RefreshMyFriends();
                clearInterval(interval);
                setshow_auto_reload_in(false);
                return 3;   // reset value
            }
            return prev - 1; // countdown
        });
    }, 1000);

    setauto_reloadsetInterval(interval);
}
function LoadMore(){
    setcurrentpage((pre)=>{return pre+1});
    // MyFriends();
}

   async function MyFriends() {
          try {
              if (listloader) {
                  return false;
              }
              setlistloader(true);
              setdisabled_loadermore_btn(true);
              setTimeout(async ()=>{
                  let url = `${API_URL}/my-friends?page=${currentpage}&limit=${limit}`;
                  let myform = JSON.stringify({user_id:LOGIN_USER._id,name:search_name});
                  let headers = {
                      'Content-Type': 'application/json',
                      'authorization': `Bearer ${LOGIN_USER.token}`,
                  };
                  let response = await Post_With_Htoken(myform, url, headers);
                  setlistloader(false);
                  setdisabled_loadermore_btn(false);
                  if(response!==""){
                      response = await response.json();
                      const data = response;
                      if (data.status == 200) {
                        let userlist = data.result.list;
                        userlist.map((item)=>{
                           return {...item,isuser_typing:false};
                        })
                        userlist.sort((a, b) => b.total_unread_message - a.total_unread_message);
                          setDatelist((prev) => [...prev, ...userlist]);
                          settotal_friend_rec((dataid) => { return data.result.total });
                          setlastpage((dataid) => { return data.result.lastpage });
                          setDatelist((prev) =>{
                            subscribe_FindUserById(prev);
                            return prev;
                          });
                      } else {
                          swal({
                              title: `${data?.message}`,
                              icon: "warning",
                          })
                      }
                  }
                },1000);
          } catch (error) {
              setdisabled_loadermore_btn(false);
              setlistloader(false);
              swal({
                  title: `Unknow error:- ${error.message}`,
                  icon: "error",
              })
          }
      }

       async function UpdateUnreadMessage(user) {
          try {
            let form = {from:user._id,to:LOGIN_USER._id};
            let url = `${API_URL}/update-read-status`;
                let myform = JSON.stringify(form);
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setDatelist((prev) => {
                            let newdatalist = prev.map(item => {
                                if (item._id === user._id) {
                                    return {
                                        ...item,
                                        total_unread_message:0,
                                    };
                                }
                                return item;
                            });
                            return newdatalist;
                        });
                        CurrentUser(user);
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
          } catch (error) {
              swal({
                  title: `Unknow error:- ${error.message}`,
                  icon: "error",
              })
          }
      }

      async function RefreshMyFriends() {
        $('.name-search').val('');
        setlimit(10);
        setcurrentpage(1);
        setsearch_name('');
        if(props.getuser){
            props.getuser(false);
        }
          try {
              if (listloader) {
                  return false;
              }
              setdisabled_loadermore_btn(true);
              setTimeout(async ()=>{
                  let url = `${API_URL}/my-friends?page=${currentpage}&limit=${limit}`;
                  let myform = JSON.stringify({user_id:LOGIN_USER._id,name:search_name});
                  let headers = {
                      'Content-Type': 'application/json',
                      'authorization': `Bearer ${LOGIN_USER.token}`,
                  };
                  let response = await Post_With_Htoken(myform, url, headers);
                  setdisabled_loadermore_btn(false);
                  if(response!==""){
                      response = await response.json();
                      const data = response;
                      if (data.status == 200) {
                        //   console.log(data);
                          setDatelist([]);
                          setDatelist(data.result.list);
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
              setdisabled_loadermore_btn(false);
              swal({
                  title: `Unknow error:- ${error.message}`,
                  icon: "error",
              })
          }
      }
      async function Refresh() {
        $('.name-search').val('');
        setlimit(10);
        currentpage = 1;
        setcurrentpage(1);
        search_name='';
        setsearch_name((pre)=>{ return ""; });
        setDatelist([]);
        MyFriends();
        if(props.getuser){
            props.getuser(false);
        }
      }
      async function Search() {
        setlimit(10);
        currentpage = 1;
        setcurrentpage(1);
        setDatelist([]);
        MyFriends();
        if(props.getuser){
            props.getuser(false);
        }
    }
    function CurrentUser(user){
        if(location.pathname!=='/web/chat'){
            navigate('/web/chat');
            window.sessionStorage.removeItem('sessionchatuser');
            window.sessionStorage.setItem('sessionchatuser',JSON.stringify(user));
            return false;
        }
        if(props.getuser){
            props.getuser(user);
        }
    }
    function VideoCall(user){
        if(location.pathname!=='/web/video-call'){
            window.sessionStorage.removeItem('sessioncalluser');
            window.sessionStorage.setItem('sessioncalluser',JSON.stringify(user));
            navigate(`/web/video-call`);
            return false;
        } else {
            if(props.getuser){
                props.getuser(user);
            }
        }
    }
    let TypingUserList = useRef([]);
    function handleUserTyping(msg){
        if(TypingUserList.current.findIndex(item=>item.from==msg?.from) !== -1){
            return false;
        }
        TypingUserList.current.push(msg);
        setDatelist((prev) => {
            let newdatalist = prev.map(item => {
                if (item._id === msg?.from) {
                    return {
                        ...item,
                        isuser_typing:true
                    };
                }
                return item;
            });
            return newdatalist;
        })
        setTimeout(() => {
            TypingUserList.current = TypingUserList.current.filter(item=>item.from !== msg?.from);
            setDatelist((prev) => {
            let newdatalist = prev.map(item => {
                if (item._id === msg?.from) {
                    return {
                        ...item,
                        isuser_typing:false
                    };
                }
                return item;
            });
            return newdatalist;
        })
        }, 2000);
    }
    return ( 
        <>
        <div className="container user-list">
<div className="profile-container">
        <div className="row row-space-20">
    <div className="col-md-12">
                <div className="tab-content p-0">

                    <div className="tab-pane fade active show" id="profile-friends">
                        <div className="m-b-10"><b className='text-dark'>My Friend List ({total_friend_rec}) </b> 
                        <a href="#"  className='Refresh'
                                onClick={(e) => {
                                    e.preventDefault();
                                    Refresh();
                                }}
                                >Refresh</a>
                         </div>
                        {show_auto_reload_in==true?
                        <div className="m-b-10"><b className='text-dark'>Auto reload in {auto_reload_in} sec</b></div>
                        :<></>
                        }
                        
                        <div className='row'>
                            <div className='col-md-8'>
                                <input type='text' className='name-search' placeholder='Search Name' onKeyUp={(e)=>{setsearch_name(e.target.value)}} />
                            </div>
                            <div className='col-md-4'>
                                <button className='btn btn-sm btn-primary' type='button' onClick={()=>Search()}>Search</button>
                            </div>
                        </div>
                        <ul className="friend-list clearfix" style={disabled_loadermore_btn ? {opacity:0.5} : {}}>

                             {datalist.map((item, index) => 
                <li key={index}>
                                <a href="#"
                                onClick={(e) => { e.preventDefault(); }}
                                >
                                    <div className="friend-img" onClick={(e) => { CurrentUser(item) }}>
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
                                        {item.isuser_typing==true ?
                                        <><div className="typing">Typing
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        </div><br/></>
                                        :<></>
                                        }
                                        {item.wsstatus ==1 ?
                                        <><small className='text-success'>Online</small><br/>
                                        <button className='text-white btn btn-sm btn-info' onClick={(e) => { CurrentUser(item) }}>Message</button> 
                                        <button className='text-white btn btn-sm btn-primary ms-1' onClick={(e) => { VideoCall(item) }}>Video Call</button></> 
                                        :
                                        <><small className='text-danger'>Offline</small><br/>
                                        <button className='text-white btn btn-sm btn-info' onClick={(e) => { CurrentUser(item) }}>Message</button> 
                                        </>
                                        }
                                        {
                                            item.total_unread_message > 0 ? <><p className='btn btn-sm btn-warning text-white ms-1' onClick={()=>UpdateUnreadMessage(item)} >{item.total_unread_message} Unread Message</p></> : <></>
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
                            { 
                            total_friend_rec > 0 ?
                                <div className='mt-1 text-center'>
                                    {
                                        currentpage == lastpage ? <></> : <><button type='button' className='btn btn-sm btn-success' disabled={disabled_loadermore_btn ? true : false} onClick={()=>LoadMore()}>Load more.</button></>
                                    }
                                </div>
                            :
                            <></>
                            }
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