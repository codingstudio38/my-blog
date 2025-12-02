import './../Css/chat-box.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL, WEBSITE_PUBLIC, API_STORAGE_URL, USER_DETAILS, SET_LOCAL, GET_LOCAL, REMOVE_LOCAL, new_chat_message } from './Constant.jsx';
import Messagefilefilter from './Messagefilefilter.jsx';
import $ from 'jquery';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
// import { WebsocketController } from './WebsocketController';
// import { w3cwebsocket } from "websocket";
import Websocket from "../Services/WebSocketService.jsx";
import swal from 'sweetalert';
function Chatlist() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [messagefile, setMessagefile] = useState("");
    const LOGIN_USER = USER_DETAILS();
    const [chatuser, setChatuser] = useState("");
    const [chatusername, setChatusername] = useState("Live Chat");
    const [chatuserphoto, setChatuserphoto] = useState(`${WEBSITE_PUBLIC}/images/no-img.jpg`);
    const [totalchat, setTotalchat] = useState("");
    const [chatboxopen, setChatboxopen] = useState(false);
    const [chatlist, setChatlist] = useState([]);
    const [loginid, setLoginid] = useState(LOGIN_USER._id);
    const [typinglabel, setTypinglabel] = useState(false);
    let [page, setPage] = useState(1);
    const activepageRef = useRef(page);
    let [limit, setLimit] = useState(10);
    let [totalpage, setTotalpage] = useState(0);
    let [activechatuser, setactivechatuser] = useState(false);
    const activeUserRef = useRef(activechatuser);
    const [chat_details, setchat_details] = useState({
        "from_user": LOGIN_USER._id,
        "to_user": '',
        "message": '',
        "file_name": "",
    });

    useEffect(() => {
        document.title = "MERN Technology || User - Chat Box";
        // REMOVE_LOCAL('activechatuser');
        if (LOGIN_USER === false) {
            window.localStorage.clear();
            navigate('./../../');
            return;
        }
        const sessionchatuser = window.sessionStorage.getItem('sessionchatuser');
        if(sessionchatuser!==null){
            if(sessionchatuser!==''){
                let user= JSON.parse(sessionchatuser);
                getuserFromChild(user);
                window.sessionStorage.removeItem('sessionchatuser');
            }
        }
        const unsubscribe = Websocket.subscribe((msg) => {
            if (msg?.code == new_chat_message) {
                let resert_data = msg.chat
                getNewmessage(resert_data)
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
    useEffect(() => {
        activeUserRef.current = activechatuser;
    }, [activechatuser]);
    useEffect(() => {
        activepageRef.current = page;
    }, [page]);
     function getNewmessage(row) {
        setactivechatuser((pre) => {
            return activeUserRef.current;
        });
        activechatuser = activeUserRef.current;
        if (!activechatuser) return;
        if (row.from_user === activechatuser._id) {
            setChatlist((prev) => [...prev, row]);
            const element = $('#chat-history');
            element.animate({
                scrollTop: element.prop("scrollHeight")
            }, 500);
        }
    }

    async function SendChat() {
        try {
            let chatuser_datais = activechatuser;
            if (!chatuser_datais) {
                swal({
                        title: "Please select a friend from friend list.",
                        icon: "warning",
                    });
                return;
            }
            let user_is = chatuser_datais;
            if (user_is.to_user == "") {
                swal({
                        title: "Please select a friend from friend list.",
                        icon: "warning",
                    });
                return;
            }
            if (chat_details.message == "") {
                swal({
                    title: "Please type some message.",
                    icon: "warning",
                });
                document.getElementById("message-to-send").focus();
                return;
            }
            let url = `${API_URL}/save-user-chat`;
            let myform = JSON.stringify(chat_details);
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            $('.disabledall').attr('disabled', true);
            let response = await Post_With_Htoken(myform, url, headers);
            $('.disabledall').removeAttr('disabled');
            if (response !== "") {
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    setMessage("");
                    setMessagefile("");
                    document.getElementById("message_form").reset();
                    setPhotosrc(`${WEBSITE_PUBLIC}/images/no-img.jpg`);
                    setShowimgbox(false);
                    // var pre_list = [];
                    setChatlist((pre) => {
                        return [...pre, data.result];
                    });
                    setTotalchat((pre) => {
                        return pre + 1;
                    })
                   
                    const element = $('#chat-history');
                    element.animate({
                        scrollTop: element.prop("scrollHeight")
                    }, 500);
                    setchat_details((pre) => {
                        return { ...pre, "message": '', "file_name": "" }
                    })
                } else {
                    swal({
                        title: `${data?.message}`,
                        icon: "warning",
                    })
                }
            }
        } catch (error) {
            $('.disabledall').removeAttr('disabled');
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    async function ActiveChatUser(user) {
        setChatlist([]);
        setTotalchat(0);
        setTotalpage(0);
        setPage(1);
        setChatuser(user._id);
        setChatboxopen(true);
        setChatusername(user.name);
        if (user.user_file_dtl.file_view_path == '') {
            setChatuserphoto(`${WEBSITE_PUBLIC}/images/no-img.jpg`);
        } else {
            setChatuserphoto(user.user_file_dtl.file_view_path);
        }
        GetActiveChatList(user._id);
    }
    async function GetActiveChatList(id) {
        try {
            let url = `${API_URL}/chat-list?page=${page}&limit=${limit}`;
            let myform = JSON.stringify({ from_user: LOGIN_USER._id, to_user: id });
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);

            if (response !== "") {
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    setChatlist(response.pagination.docs);
                    // console.log(response.pagination.docs);
                    // console.log(chatlist);
                    setTotalchat(response.total);
                    setTotalpage(response.pagination.totalpage);
                    // setPage(result.pagination.current_page);
                    setTimeout(() => {
                        const element = document.getElementById("chat-history");
                        element.scrollTop = element.scrollHeight;
                    }, 400)
                    // const element = $('#chat-history');
                    // element.animate({
                    //     scrollTop: element.prop("scrollHeight")
                    // }, 500);
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
    const PageChange = async () => {
        activepageRef.current = activepageRef.current+1
        page = activepageRef.current;
        setPage((prevCount) =>{return activepageRef.current;});
        try {
            let url = `${API_URL}/chat-list?page=${page}&limit=${limit}`;
            let myform = JSON.stringify({ from_user: LOGIN_USER._id, to_user: activechatuser._id });
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
            if (response !== "") {
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    setChatlist((pre)=>{
                        return [...response.pagination.docs,...pre];
                    });
                    setTotalchat(response.total);
                    setTotalpage(response.pagination.totalpage);
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
    };
       

    const [photosrc, setPhotosrc] = useState(`${WEBSITE_PUBLIC}/images/no-img.jpg`);
    const [showimgbox, setShowimgbox] = useState(false);
    async function setIMGPhoto(event) {
        try {
            let url = `${API_URL}/upload-chat-file`;
            let myform = new FormData();
            myform.append("photo", event.target.files[0]);
            myform.append("userid", LOGIN_USER._id);
            let headers = {
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            $('.disabledall').attr('disabled', true);
            let response = await Post_With_Htoken(myform, url, headers);
            $('.disabledall').removeAttr('disabled');
            if (response !== "") {
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    setchat_details((pre) => {
                        return { ...pre, "file_name": data.file_name }
                    })
                    var name = event.target.files[0].name;
                    var ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
                    if (ext === "gif" || ext === "png" || ext === "PNG" || ext === "jpeg" || ext === "jpg" || ext === "jfif" || ext === "webp") {
                        // var reader = new FileReader();
                        // reader.onload = function (event) {
                        //     setPhotosrc(event.target.result);
                        // };
                        // reader.readAsDataURL(event.target.files[0]);
                        setPhotosrc(data.result);
                    } else if (ext === "xlsx" || ext === "xls") {
                        setPhotosrc(`${WEBSITE_PUBLIC}/images/excel.png`);
                    } else if (ext === "pdf") {
                        setPhotosrc(`${WEBSITE_PUBLIC}/images/pdf.png`);
                    } else if (ext === "docx" || ext === "doc") {
                        setPhotosrc(`${WEBSITE_PUBLIC}/images/doc.png`);
                    } else {
                        setPhotosrc(`${WEBSITE_PUBLIC}/images/Icon-doc.png`);
                    }
                    setMessagefile(event.target.files[0]);
                    setShowimgbox(true);
                    swal({
                        title: `Successfully uploaded`,
                        icon: "success",
                    })
                    event.target.value = "";
                } else {
                    setchat_details((pre) => {
                        return { ...pre, "file_name": "" }
                    })
                    swal({
                        title: `${data?.message}`,
                        icon: "warning",
                    })
                }
            }
        } catch (error) {
            $('.disabledall').removeAttr('disabled');
            setchat_details((pre) => {
                return { ...pre, "file_name": "" }
            });
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    function closeImgdiv() {
        setShowimgbox(false);
        setMessagefile("");
        setPhotosrc(`${WEBSITE_PUBLIC}/inages/no-img.jpg`);
    }

    function onNewMessageSound() {
        const audio = new Audio(`${WEBSITE_PUBLIC}/sound/Messenger_Notification.mp3`);
        audio.play();
    }
    function getuserFromChild(user) {
        if (!user) {
            setChatlist([]);
            setTotalchat(0);
            setTotalpage(0);
            setPage(1);
            setChatuser("");
            setChatboxopen("");
            setChatusername("Live Chat");
            setChatuserphoto(`${WEBSITE_PUBLIC}/images/no-img.jpg`);
            setactivechatuser((pre) => { return false; });
            activeUserRef.current = false;
            setchat_details((pre) => {
                return {
                    "from_user": LOGIN_USER._id,
                    "to_user": '',
                    "message": '',
                    "file_name": "",
                }
            })
        } else {
            if (chat_details.to_user !== user._id) {
                setactivechatuser((pre_user) => { return user; });
                activeUserRef.current = user;
                setchat_details((pre) => {
                    return { ...pre, "to_user": user._id, "from_user": LOGIN_USER._id }
                })
                ActiveChatUser(user);
                
            }
        }
    }
    return (
        <div>

            <div className="container-chat container clearfix">
                <h2 style={{ "textAlign": "center", "textDecoration": "underline" }}>React JS Live Chat Box</h2>
                <h3>Name :- {LOGIN_USER.name}, my id:-{LOGIN_USER._id}</h3>
                <div className="row" style={{ "marginBottom": "30px" }}>
                    <div className="col-md-4" style={{ 'padding': '0px', backgroundColor: 'aliceblue' }}>
                        <div className="people-list" id="people-list">
                            <Userslist getuser={getuserFromChild} />
                        </div>
                    </div>
                    <div className="col-md-8" style={{ 'padding': '0px' }}>
                        <div className="chat" style={{ "width": "100%" }}>
                            <div className="chat-header clearfix">
                                <img src={chatuserphoto} alt="avatar" className='chat-avatar' />
                                <div className="chat-about">
                                    <div className="chat-with">{chatusername}</div>
                                    <div className="chat-num-messages">already {totalchat} messages you sent</div>
                                </div>
                                <i className="fa fa-star" />
                            </div>
                            <div className="chat-history" id="chat-history">
                                <div className="col-md-12 text-center">
                                    {page < totalpage ?
                                        <button type="button"
                                            className="btn btn-success btn-sm text-center" onClick={PageChange} style={{ margin: '5px' }} title="Load More.." >Page {page}/{totalpage} Load More..</button> :
                                        <></>}



                                </div>
                                <ul>
                                    {
                                        chatlist.map((item, index) =>


                                            <li className="clearfix" key={index} data-id={item.intid}>

                                                {item.sender == loginid ?
                                                    < div >
                                                        {
                                                            item.chat_file !== null && item.message !== null ?

                                                                <><div className="message-data align-right">
                                                                    <span className="message-data-time">{item.created_at}</span> &nbsp; &nbsp;
                                                                    <span className="message-data-name">You</span> <i className="fa fa-circle me" />
                                                                </div>
                                                                    <div className="message other-message float-right">
                                                                        <i className="fa fa-chevron-down mycon" aria-hidden="true"></i>
                                                                        <Messagefilefilter row={item} />

                                                                        {item.message}

                                                                    </div></>

                                                                : item.chat_file == null && item.message !== null ?

                                                                    <><div className="message-data align-right">
                                                                        <span className="message-data-time">{item.created_at}</span> &nbsp; &nbsp;
                                                                        <span className="message-data-name">You</span> <i className="fa fa-circle me" />
                                                                    </div>
                                                                        <div className="message other-message float-right">
                                                                            <i className="fa fa-chevron-down mycon" aria-hidden="true"></i>
                                                                            {item.message}

                                                                        </div></>
                                                                    : item.chat_file !== null && item.message == null ?

                                                                        <><div className="message-data align-right">
                                                                            <span className="message-data-time">{item.created_at}</span> &nbsp; &nbsp;
                                                                            <span className="message-data-name">You</span> <i className="fa fa-circle me" />
                                                                        </div>
                                                                            <div className="message other-message float-right">
                                                                                <i className="fa fa-chevron-down mycon" aria-hidden="true"></i>
                                                                                <Messagefilefilter row={item} />

                                                                            </div></>
                                                                        : <><div className="message-data align-right">
                                                                            <span className="message-data-time">{item.created_at}</span> &nbsp; &nbsp;
                                                                            <span className="message-data-name">You</span> <i className="fa fa-circle me" />
                                                                        </div>
                                                                            <div className="message other-message float-right">
                                                                                <i className="fa fa-chevron-down mycon" aria-hidden="true"></i>
                                                                                {item.message}

                                                                            </div></>
                                                        }

                                                    </div>

                                                    :
                                                    <div className="c-width">
                                                        {
                                                            item.chat_file !== null && item.message !== null ?

                                                                <><div className="message-data">
                                                                    <span className="message-data-name"><i className="fa fa-circle online" /> {chatusername}</span>
                                                                    <span className="message-data-time">{item.created_at}</span>
                                                                </div>
                                                                    <div className="message my-message">
                                                                        <i className="fa fa-chevron-down other" aria-hidden="true"></i>
                                                                        <Messagefilefilter row={item} />
                                                                        {item.message}

                                                                    </div></>

                                                                : item.chat_file == null && item.message !== null ?

                                                                    <><div className="message-data">
                                                                        <span className="message-data-name"><i className="fa fa-circle online" /> {chatusername}</span>
                                                                        <span className="message-data-time">{item.created_at}</span>
                                                                    </div>
                                                                        <div className="message my-message">
                                                                            <i className="fa fa-chevron-down other" aria-hidden="true"></i>
                                                                            {item.message}

                                                                        </div></>
                                                                    : item.chat_file !== null && item.message == null ?

                                                                        <><div className="message-data">
                                                                            <span className="message-data-name"><i className="fa fa-circle online" /> {chatusername}</span>
                                                                            <span className="message-data-time">{item.created_at}</span>
                                                                        </div>
                                                                            <div className="message my-message">
                                                                                <i className="fa fa-chevron-down other" aria-hidden="true"></i>
                                                                                <Messagefilefilter row={item} />

                                                                            </div></>
                                                                        : <><div className="message-data">
                                                                            <span className="message-data-name"><i className="fa fa-circle online" /> {chatusername}</span>
                                                                            <span className="message-data-time">{item.created_at}</span>
                                                                        </div>
                                                                            <div className="message my-message">
                                                                                <i className="fa fa-chevron-down other" aria-hidden="true"></i>
                                                                                {item.message}

                                                                            </div></>
                                                        }
                                                    </div>
                                                }

                                            </li>


                                        )
                                    }

                                </ul>
                            </div>
                            <div className={showimgbox === true ? "file-view-area show" : "file-view-area hide"}>
                                <img src={photosrc} className='images' id='images' />
                                <div className='cross-div' onClick={() => closeImgdiv()}>
                                    <i className="fa fa-times-circle cross" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="chat-message clearfix">
                                <form id='message_form' method='post' encType='multipart/form-data'>
                                    {
                                        typinglabel == true ? <><label>User is typing <img src={`${WEBSITE_PUBLIC}/typing-loader.gif`} style={{ width: '19px' }} /></label></>
                                            : <></>
                                    }

                                    <textarea name="message-to-send" className='disabledall' id="message-to-send" placeholder="Type your message" rows={3} defaultValue={""}
                                        onChange={(e) => setchat_details({ ...chat_details, message: e.target.value })}
                                    />
                                    {/* onKeyUp={() => TypeinggMassageFN(false)} onKeyDown={() => TypeinggMassageFN(true)}  */}
                                    <label className="fa fa-file-image-o" htmlFor="IMGPhoto"></label>
                                    <input id="IMGPhoto" className='disabledall' type="file" accept="image/png, image/gif, image/jpeg,.xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf" onChange={(e) => setIMGPhoto(e)} />

                                    <button type='button' className='disabledall' style={{ marginLeft: '5px' }} onClick={() => SendChat()}>Send</button>


                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
export default Chatlist;