import React, { useState, useEffect,useRef } from 'react';
import Logout from './Logout';
import Container from 'react-bootstrap/Container';
import { new_friend_request,cancel_friend_request,accept_friend_request,reject_friend_request,remove_friend,WEBSITE_URL,USER_DETAILS ,API_URL,blog_post_status} from './Constant.jsx';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
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
    const LOGIN_USER = USER_DETAILS();
        useEffect(() => {
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            AllNotifications();
             const unsubscribe = Websocket.subscribe((msg) => {
                        if(msg?.code==new_friend_request){
                            let resert_data = msg.result
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==cancel_friend_request){
                            let resert_data = msg.result
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==accept_friend_request){
                            let resert_data = msg.result
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==reject_friend_request){
                            let resert_data = msg.result
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        } else if(msg?.code==remove_friend){
                            let resert_data = msg.result
                            settotal_rec((pre) => { return pre+1 });
                            setDatelist((prev) => [resert_data,...prev]);
                        }else if(msg?.code==blog_post_status){
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
        }, []);
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
                          let newdatalist = datalist.filter((item) => {
                                return item._id !== row._id;
                            });
                            settotal_rec((pre) => { return pre-1 });
                            setDatelist((prev) => {return newdatalist});
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
    return (
        <Navbar bg="primary" variant="dark">
            <Container>
                <Nav className="me-auto">
                    <NavLink className={"navlink"} to="/web/home">Home</NavLink>
                    <NavLink className={"navlink"} to="/web/create-blog">My blog</NavLink>
                    <NavLink className={"navlink"} to="/web/my-profile">Profile</NavLink>
                    <NavLink className={"navlink"} to="/web/find-friends">Find Friends</NavLink>
                    <NavLink className={"navlink"} to="/web/friend-rquest-send-list">Send Request Status List</NavLink>
                     <NavLink className={"navlink"} to="/web/new-friend-request-list">New Friend Request List</NavLink>
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
                        <h3 className="text-center">Notification <button type='button' className='btn btn-success btn-sm Refresh' onClick={()=>Refresh()}  >Refresh</button></h3> 
                        
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
                    <><img src='/images/image-not-found.png' title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
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
                    <><img src='/images/image-not-found.png' title={item.to_user_name} alt={item.to_user_name}
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
                    <><img src='/images/image-not-found.png' title={item.from_user_name} alt={item.from_user_name} loading="lazy" />
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
                    <><img src='/images/image-not-found.png' title={item.to_user_name} alt={item.to_user_name}
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
                        <><img src='/images/image-not-found.png' title={item.to_user_name} alt={item.to_user_name} loading="lazy" />
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
                        <><img src='/images/image-not-found.png' title={item.from_user_name} alt={item.from_user_name}
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
                    <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
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
                    <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
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
                    <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
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
                    <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
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
                    <><img src='/images/image-not-found.png' title={item.to_user_name}  alt={item.to_user_name} loading="lazy"/></>
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
                    <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
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
            }}
            key={index}
            className={item.read_status <= 0 ? 'notification-list notification-list--unread':'notification-list'}>
                <div className="notification-list_img">
                {
                    item.from_user_file_view_path == "" ? 
                    <><img src='/images/image-not-found.png' title={item.from_user_name}  alt={item.from_user_name} loading="lazy"/></>
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
    )
}