import './../Css/AllNotifications.css';
import Websocket from "./../Services/WebSocketService";
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post_With_Htoken } from '../Services/Https.jsx';
import $ from 'jquery';
import { new_friend_request,cancel_friend_request,accept_friend_request,reject_friend_request,remove_friend,WEBSITE_URL,USER_DETAILS ,API_URL,blog_post_status,subscribe_auto_read_notificationsFn,call_auto_read_notificationsFnHeader} from './Constant.jsx';
export default function Allnotifications(){
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(15);
    const [total_rec, settotal_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    const [readstatusloader, setreadstatusloader] = useState(false);
    useEffect(() => {
        if (LOGIN_USER === false) {
                navigate('/');
                return;
            }
             if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            subscribe_auto_read_notificationsFn(ReadThis)
            AllNotifications();
        const unsubscribe = Websocket.subscribe((msg) => {
            // console.log(12212,msg);
            if(msg?.code==new_friend_request){
                let resert_data = msg.result
                setDatelist((prev) => [resert_data,...prev]);
            } else if(msg?.code==cancel_friend_request){
                let resert_data = msg.result
                setDatelist((prev) => [resert_data,...prev]);
            } else if(msg?.code==accept_friend_request){
                let resert_data = msg.result
                setDatelist((prev) => [resert_data,...prev]);
            } else if(msg?.code==reject_friend_request){
                let resert_data = msg.result
                setDatelist((prev) => [resert_data,...prev]);
            } else if(msg?.code==remove_friend){
                let resert_data = msg.result
                setDatelist((prev) => [resert_data,...prev]);
            }else if(msg?.code==blog_post_status){
                // console.log('dsdsd',blog_post_status);
                GetBlogNotification(msg.result)
            }
            
        });
        // const unsubscribeClose = Websocket.onClose(() => {
        //     console.error("Disconnected from WS server! Allnotifications.js");
        // });
        return () => {
            unsubscribe();
            // unsubscribeClose();
        };
    },[]);
    const sendMsg = () => {
    Websocket.send({
      type: "message",
      text: "Hello from Allnotifications.js functional component!",
    });
  };
  async function GetBlogNotification(blogid){
        try {
            // console.log('blogid',blogid);
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
                // console.log('data',data);
                if (data.status == 200) {
                    // console.log(data);
                    // console.log(data.result.total);
                    if(data.result.total > 0){
                        // console.log('ata.result',data.result);
                        settotal_rec((pre) => { return pre+1 });
                        setDatelist((prev) => [data.result.list[0],...prev]);
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
    async function AllNotifications() {
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
                    setDatelist((dataid) => { return data.result.list });
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
                    call_auto_read_notificationsFnHeader(row);
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
        setcurrentpage(1);
        setlimit(15);
        AllNotifications();
    }
    return (
        <>
        <div className="container left-notifications-list">
<div className="profile-container">
        <div className="row row-space-20">
    <div className="col-md-12">
                <div className="tab-content p-0">

                    <div className="tab-pane fade active show" id="profile-friends">
                        <div className="m-b-10">
                            <div className='row'>
                                <div className='col-md-8'>
 <b className='text-dark'>Notifications ({total_rec})</b> 
                                </div>
                                <div className='col-md-4'>
 <button type='button' className='btn btn-primary btn-sm All'>All</button>
<button type='button' className='btn btn-success btn-sm Refresh' onClick={()=>Refresh()} >Refresh</button>
                                </div>
                            </div>
                       
                       
                        </div>
                       
 
                        {listloader==true ? <>
                        <div className='text-center not-loader'>
                            <div className="spinner-grow text-primary" role="status">
                            <span className="sr-only"></span>
                            </div>
                        </div>
                        </> : <>
                        <ul className={readstatusloader==true ? 'readstatusloader friend-list clearfix':'friend-list clearfix'}>
                            {datalist.map((item, index) => 
                             
    item.category == new_friend_request ? 
        <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='new-request-text-color'>New Friend Request</small><br/>
                <div className="friend-img">
                    {
                        item.from_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.from_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
    : item.category == cancel_friend_request  ? 
         <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='cencel-request-text-color'>Cancel Friend Request</small><br/>
                <div className="friend-img">
                    {
                        item.from_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.from_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
    : item.category == accept_friend_request  ?
        <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='accept-request-text-color'>Friend Request Accepted</small><br/>
                <div className="friend-img">
                    {
                        item.to_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.to_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
    : item.category == reject_friend_request  ?
        <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='reject-request-text-color'>Friend Request Rejected</small><br/>
                <div className="friend-img">
                    {
                        item.to_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.to_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
    : item.category == remove_friend  ?
        item.remove_byid == item.from ?
        <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='reject-request-text-color'>Remove Friend</small><br/>
                <div className="friend-img">
                    {
                        item.from_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.from_user_file_view_path} title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.from_user_name} remove {item.to_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
         :
         <li className='li-class' key={index} id={item._id}>
            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='reject-request-text-color'>Remove Friend</small><br/>
                <div className="friend-img">
                    {
                        item.to_user_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                            :  
                        <><img src={item.to_user_file_view_path} title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.to_user_name} remove {item.from_user_name}</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>
        </li>
    : item.category == blog_post_status  ?
    <li className='li-class' key={index} id={item._id}>

            <a 
            href="#"
            onClick={(e) => {
                e.preventDefault();
                 ReadThis(item);
            }}
            className={item.read_status <= 0 ? 'not-read':'read'} >
                <small className='text-success'>New Bolg Post</small><br/>
                <div className="friend-img">
                    {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                        item.blog_file_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_file_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.blog_title}  alt={item.blog_title} loading="lazy"/>1</>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                    : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                        item.blog_thumbnail_view_path == "" ? 
                        <><img src='/images/image-not-found.png' title={item.blog_title}  alt={item.blog_title} loading="lazy"/></>
                            :  
                        <><img src={item.blog_thumbnail_view_path} title={item.blog_title}  alt={item.blog_title} loading="lazy"/></> 
                    : 
                    <></> 
                    }
                </div>
                <div className="friend-info text-left">
                    <h4>{item.from_user_name} post a new blog</h4>
                    <small>{item.created_at}</small>
                </div>
            </a>

        </li>
    : 
    <></> 
    
                             

                        )
                    }
                            
                        </ul>


</>}

                    </div>
                </div>
            </div>
  </div>
</div>
</div>
        </>
    )
}