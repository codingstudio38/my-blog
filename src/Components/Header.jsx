import React, { useState, useEffect,useRef } from 'react';
import Logout from './Logout';
import Container from 'react-bootstrap/Container';
import { new_friend_request,cancel_friend_request,accept_friend_request,reject_friend_request,remove_friend,WEBSITE_URL,USER_DETAILS ,API_URL,blog_post_status,subscribe_auto_read_notificationsFnHeader,call_auto_read_notificationsFn,subscribe_auto_refresh_notifications,call_auto_refresh_notifications,new_chat_message,Truncatetext} from './Constant.jsx';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate, NavLink,useLocation } from 'react-router-dom';
import Websocket from "./../Services/WebSocketService";
import { Post_With_Htoken } from '../Services/Https.jsx';
import './../Css/Header.css';


export default function Header(){
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(10);
    const [total_rec, settotal_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    const [readstatusloader, setreadstatusloader] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const LOGIN_USER = USER_DETAILS();
        useEffect(() => {
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            subscribe_auto_read_notificationsFnHeader(ReadThisCallFromAllnotification)
            subscribe_auto_refresh_notifications(Refresh)
            AllNotifications();
             const unsubscribe = Websocket.subscribe((msg) => {
                        if(msg?.code==new_friend_request){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==cancel_friend_request){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==accept_friend_request){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==reject_friend_request){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==remove_friend){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        }else if(msg?.code==blog_post_status){
                            GetBlogNotification(msg.result)
                        }else if(msg?.code==new_chat_message){
                            let resert_data = msg.result;
                            shownotifydivFn(resert_data);
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        }
                        
                    });
                    // const unsubscribeClose = Websocket.onClose(() => {
                    //     console.error("Disconnected from WS server! Allnotifications.js");
                    // });
                    return () => {
                        unsubscribe();
                        // unsubscribeClose();
                    };
        }, []);

        let [hide_time, sethide_time] = useState(2);
        let [check_notification_time, secheck_notification_time] = useState(false);
        const check_notification_timeRef = useRef(check_notification_time);
        const [shownotify_div, setshownotify_div] = useState(false);
        const [notify_data, setnotify_data] = useState(null);
        let [auto_hideNotifydivInterval, setauto_hideNotifydivInterval] = useState(null);

        function shownotifydivFn(resert_data){
            if(check_notification_timeRef.current){
                return false;
            }
            setnotify_data(resert_data);
            check_notification_timeRef.current = true;
            setshownotify_div(true);
            secheck_notification_time(true);
            playNotificationSound();
            const interval = setInterval(() => {
                sethide_time((prev) => {
                    if (prev === 0) {
                        clearInterval(interval);
                        setshownotify_div(false);
                        check_notification_timeRef.current = false;
                        secheck_notification_time(false);
                        return 2;   // reset value
                    }
                    return prev - 1; // countdown
                });
            }, 1000);
            setauto_hideNotifydivInterval(interval);
        }
        function playNotificationSound() {
        const audio = new Audio(`${WEBSITE_URL}/sound/Messenger_Notification.mp3`);
            audio.volume = 1.0; // optional
            audio.play().catch(err => {
                console.log("Sound blocked until user interacts with page");
            });
        }
        function hidediv(){
            check_notification_timeRef.current = false;
            setshownotify_div(false);
            secheck_notification_time(false);
            sethide_time(2);
            if(auto_hideNotifydivInterval){
                clearInterval(auto_hideNotifydivInterval);
            }
            if(notify_data.category==blog_post_status){
                navigate(`/web/blog-details/${notify_data.remove_byid}`);
                return true;
            } else if(notify_data.category==new_chat_message){
                if(location.pathname!=='/web/chat'){
                    navigate(`/web/chat`);
                    return true;
                }
            }else if(notify_data.category==new_friend_request){
                navigate(`/web/new-friend-request-list`);
                return true;
            }
        }

        async function AllNotifications(){
            try {
                if (listloader) {
                    return false;
                }
                setlistloader(true);
                setTimeout(async ()=>{
    
                
                let url = `${API_URL}/all-notifications?page=${currentpage}&limit=${limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id});
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
                        // setDatelist((prev) => [...prev, ...data.result.list]);
                        setDatelist((prev) => {return data.result.list;});
                        settotal_rec((dataid) => { return data.result.total });
                        setlastpage((dataid) => { return data.result.lastpage });
                    } else {
                        console.error('notifications->',{
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },1000)
            } catch (error) {
                setlistloader(false);
                console.error('notifications->',{
                    title: `Unknow error:- ${error.message}`,
                    icon: "error",
                })
            }
        }
        async function GetBlogNotification(blogid){
            try {
                let url = `${API_URL}/all-notifications?page=${currentpage}&limit=${limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:blogid});
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
                        // console.log(data);
                        // console.log(data.result.total);
                        if(data.result.total > 0){
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [data.result.list[0],...prev]);
                            shownotifydivFn(data.result.list[0]);
                        }
                    } else {
                        console.error('notifications->',{
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            } catch (error) {
                console.error('notifications->',{
                    title: `Unknow error:- ${error.message}`,
                    icon: "error",
                })
            }
        }
        function BlogDetails(row){
            if(row.remove_byid!==""){
                navigate(`/web/blog-details/${row.remove_byid}`);
            }
            return true;
        }
        async function ReadThis(row) {
                try {
                    if(row.read_status > 0){
                         return false;
                    }
                    if (readstatusloader) {
                        return false;
                    }
                    setreadstatusloader(true);
                    let url = `${API_URL}/read-notification`;
                    let myform = JSON.stringify({id:row._id});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    let response = await Post_With_Htoken(myform, url, headers);
                    setreadstatusloader(false);
                    if(response!==""){
                        response = await response.json();
                        const data = response;
                        if (data.status == 200) {
                            // $(`#${row._id}`).fadeOut('slow');
                            call_auto_read_notificationsFn(row);
                            setDatelist((prev) => {
                                let newdatalist = prev.filter((item) => {
                                        return item._id !== row._id;
                                    });
                                return newdatalist
                            });
                            settotal_rec((pre) => { return pre-1 });
                            if(row.category==blog_post_status){
                                navigate(`/web/blog-details/${row.remove_byid}`);
                                return true;
                            } else if(row.category==new_chat_message){
                                // navigate(`/web/chat`);
                                // return true;
                            }else if(row.category==new_friend_request){
                                navigate(`/web/new-friend-request-list`);
                                return true;
                            }
                        } else {
                            console.error('notifications->',{
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    }
                } catch (error) {
                    setreadstatusloader(false);
                    console.error('notifications->',{
                        title: `Unknow error:- ${error.message}`,
                        icon: "error",
                    })
                }
            }
            async function ReadThisCallFromAllnotification(row) {
                try {
                    if(row.read_status > 0){
                         return false;
                    }
                    if (readstatusloader) {
                        return false;
                    }
                    setreadstatusloader(true);
                    let url = `${API_URL}/read-notification`;
                    let myform = JSON.stringify({id:row._id});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    let response = await Post_With_Htoken(myform, url, headers);
                    setreadstatusloader(false);
                    if(response!==""){
                        response = await response.json();
                        const data = response;
                        if (data.status == 200) {
                            // $(`#${row._id}`).fadeOut('slow');
                            setDatelist((prev) => {
                                let newdatalist = prev.filter((item) => {
                                        return item._id !== row._id;
                                    });
                                return newdatalist
                            });
                            settotal_rec((pre) => { return pre-1 });
                        } else {
                            console.error('notifications->',{
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    }
                } catch (error) {
                    setreadstatusloader(false);
                    console.error('notifications->',{
                        title: `Unknow error:- ${error.message}`,
                        icon: "error",
                    })
                }
            }
            function Refresh(){
                setlimit(10);
                setcurrentpage(1);
                AllNotifications();
            }
        
       async function ClearAll(){
                try {
                let url = `${API_URL}/clear-all-notifications`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        Refresh();
                        call_auto_refresh_notifications();
                    } else {
                        console.error('notifications->',{
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            } catch (error) {
                setlistloader(false);
                console.error('notifications->',{
                    title: `Unknow error:- ${error.message}`,
                    icon: "error",
                })
            }
        }

    return (
         <>
        <Navbar bg="primary" variant="dark">
            <Container>
                <Nav className="me-auto">
                    <NavLink className={"navlink"} to="/web/home">Home</NavLink>
                    <NavLink className={"navlink"} to="/web/create-blog">New Blog</NavLink>
                    <NavLink className={"navlink"} to="/web/my-profile">Profile</NavLink>
                    <NavLink className={"navlink"} to="/web/find-friends">Find Friends</NavLink>
                    <NavLink className={"navlink"} to="/web/friend-rquest-send-list">Send Request Status List</NavLink>
                    <NavLink className={"navlink"} to="/web/new-friend-request-list">New Friend Request List</NavLink>
                    <NavLink className={"navlink"} to="/web/chat">Chat</NavLink>
                    <NavLink className={"navlink"} to="/web/video-call">Video CAll</NavLink>
                </Nav>
                {
                    LOGIN_USER!==false?
                        <>
                <Nav>
                                <NavDropdown className='header-notifications' title={`Notifications (${total_rec})`}>
                                   <ul className="navbar-nav ml-auto Notifications-NavDropdown" >
                  <li className="nav-item dropdown notification-ui show">
                    <div className="dropdown-menu notification-ui_dd show" aria-labelledby="navbarDropdown">
                      <div className="notification-ui_dd-header">
                        <h3 className="text-center">Notification <button type='button' className='btn btn-success btn-sm Refresh' onClick={()=>{Refresh();call_auto_refresh_notifications()}}  >Refresh</button> <button type='button' className='btn btn-warning btn-sm Refresh' onClick={()=>{ClearAll()}}  >Clear All</button></h3> 
                        
                      </div>
                      {listloader==true ? <>
                        <div className='text-center not-loader'>
                            <div className="spinner-grow text-primary" role="status">
                            <span className="sr-only"></span>
                            </div>
                        </div>
                        </> : <>
                      <div className="notification-ui_dd-content">
{datalist.map((item, index) => 
item.category == new_friend_request ? 
        <div onClick={(e)=> {
            e.preventDefault();
            ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread' :'notification-list'}>
                <div className="notification-list_img">
                    {
                    item.from_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    :
                    <><img src={item.from_user_file_view_path} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    }
                </div>
                <div className="notification-list_detail">
                    <p><b className='new-request-text-color'>{item.from_user_name}</b> New Friend Request</p>
                    <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                    {
                    item.to_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    :
                    <><img src={item.to_user_file_view_path} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    }
                </div>
        </div>
    : item.category == cancel_friend_request  ? 
        <div onClick={(e)=> {
            e.preventDefault();
            ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread' :'notification-list'}>
                <div className="notification-list_img">
                    {
                    item.from_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    :
                    <><img src={item.from_user_file_view_path} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    }
                </div>
                <div className="notification-list_detail">
                    <p><b className='cencel-request-text-color'>{item.from_user_name}</b> Cancel Friend Request</p>
                    <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                    {
                    item.to_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    :
                    <><img src={item.to_user_file_view_path} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    }
                </div>
        </div>
    : item.category == accept_friend_request  ?
            <div onClick={(e)=> {
                e.preventDefault();
                ReadThis(item);
                }}
                key={index}
                className={item.read_status <= 0 ? 'notification-list notification-list--unread' :'notification-list'}>
                    <div className="notification-list_img">
                        {
                        item.to_user_file_view_path == "" ?
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name} alt={item.to_user_name} loading="lazy" />
                        </>
                        :
                        <><img src={item.to_user_file_view_path} title={item.to_user_name} alt={item.to_user_name} loading="lazy" />
                        </>
                        }
                    </div>
                    <div className="notification-list_detail">
                        <p><b className='accept-request-text-color'>{item.to_user_name}</b> Friend Request Accepted</p>
                        <p><small>{item.created_at}</small></p>
                    </div>
                    <div className="notification-list_feature-img">
                        {
                        item.from_user_file_view_path == "" ?
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name} alt={item.from_user_name}
                                loading="lazy" /></>
                        :
                        <><img src={item.from_user_file_view_path} title={item.from_user_name} alt={item.from_user_name}
                                loading="lazy" /></>
                        }
                    </div>
            </div>
    : item.category == reject_friend_request  ?
            <div 
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread':'notification-list'}>
                <div className="notification-list_img">
                {
                    item.to_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                }
                </div>
                <div className="notification-list_detail">
                <p><b className='reject-request-text-color'>{item.to_user_name}</b> Friend Request Rejected</p>
                <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                {
                    item.from_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                }
                </div>
            </div>
    : item.category == remove_friend  ?
        item.remove_byid == item.from ?
        <div 
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread':'notification-list'}>
                <div className="notification-list_img">
                {
                    item.from_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                }
                </div>
                <div className="notification-list_detail">
                <p><b className='reject-request-text-color'>{item.from_user_name}</b> remove {item.to_user_name}</p>
                <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                {
                    item.to_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                }
                </div>
            </div>
         :
         <div 
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread':'notification-list'}>
                <div className="notification-list_img">
                {
                    item.to_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                }
                </div>
                <div className="notification-list_detail">
                <p><b className='reject-request-text-color'>{item.to_user_name}</b> remove {item.from_user_name}</p>
                <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                {
                    item.from_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                }
                </div>
            </div>
         
    : item.category == blog_post_status  ?
    <div 
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
                // BlogDetails(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread':'notification-list'}>
                <div className="notification-list_img">
                {
                    item.from_user_file_view_path == "" ? 
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                        :  
                    <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                }
                </div>
                <div className="notification-list_detail">
                <p><b className='text-success'>{item.from_user_name}</b> post a new blog</p>
                <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                    {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                        item.blog_file_view_path == "" ? 
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_file_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.blog_title}  alt={item.blog_title} loading="lazy"/>1</>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></> 
                    : 
                    <></> 
                    }
               
                </div>
            </div>
    :item.category == new_chat_message  ?
            <div onClick={(e)=> {
            e.preventDefault();
            ReadThis(item);
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread' :'notification-list'}>
                <div className="notification-list_img">
                    {
                    item.from_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    :
                    <><img src={item.from_user_file_view_path} title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
                    </>
                    }
                </div>
                <div className="notification-list_detail">
                    <p><b className='text-primary'>{item.from_user_name}</b> {item.text}</p>
                    <p><small>{item.created_at}</small></p>
                </div>
                <div className="notification-list_feature-img">
                    {
                    item.to_user_file_view_path == "" ?
                    <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    :
                    <><img src={item.to_user_file_view_path} title={item.to_user_name} alt={item.to_user_name}
                            loading="lazy" /></>
                    }
                </div>
        </div>
        : 
    <></>
 )
                    }
                         
                      </div>
                        </>}
                      <div className="notification-ui_dd-footer">
                        <a href="#!" className="btn btn-success btn-block btn-view-all">View All</a>
                      </div>
                    </div>
                  </li>
                  
                </ul>
                                </NavDropdown>
            </Nav>
                            <Nav>
                                <NavDropdown title={LOGIN_USER.name}>
                                    <NavDropdown.Item onClick={() => { navigate('/web/my-profile') }}>Profile</NavDropdown.Item>
                                    <NavDropdown.Item ><Logout/></NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            </>
                        : null
                }
            </Container>
        </Navbar>
       
  {
    shownotify_div==true ? <>
    <div className="alert alert-success alert-dismissible fade show  alert-close" role="alert" onClick={hidediv}>
       {
        notify_data.category == new_friend_request ? 
            <><strong>{notify_data.from_user_name}.</strong> Send friend request.</>
        : notify_data.category == cancel_friend_request  ? 
            <><strong>{notify_data.from_user_name}.</strong> Cancel friend request</>
        : notify_data.category == accept_friend_request  ?
            <><strong>{notify_data.to_user_name}.</strong> Accept friend request.</>
        : notify_data.category == reject_friend_request  ?
            <><strong>{notify_data.to_user_name}.</strong> Reject friend request.</>
        : notify_data.category == remove_friend  ?
            notify_data.remove_byid == notify_data.from ?
            <><strong>{notify_data.from_user_name}.</strong> Remove you from friend list.</>
            :
            <><strong>{notify_data.to_user_name}.</strong> Remove you from friend list.</>
        : notify_data.category == blog_post_status  ?
            <><strong>{notify_data.from_user_name}.</strong> Post a new blog</>
        :notify_data.category == new_chat_message  ?
            <><strong>{notify_data.from_user_name}.</strong> <Truncatetext text={notify_data.text} maxLength={50} /></>
        : 
            <></>
        }
    </div>
    </> : 
    <></>
  }  

        </>
    )
}