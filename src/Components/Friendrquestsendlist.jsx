import './../Css/Findfriend.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import Allnotifications from './Allnotifications.jsx';
import Findfriendloader from './Findfriendloader.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
export default function Friendrquestsendlist(){
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(8);
    const [total_rec, settotal_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    const [current_scroll_position, setCurrent_scroll_position] = useState(0);
    const [pre_scroll_position, setPre_scroll_position] = useState(0);
    const [disabled_sendrequest, setdisabled_sendrequest] = useState(false);
      useEffect(() => {
            document.title = "MERN Technology || Friend Rquest Send List";
            if (LOGIN_USER === false) {
                navigate('/');
                return;
            }
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            AllUsers()
        }, [currentpage]);
    useEffect(() => {
        window.addEventListener("scroll", handelInfiniteScroll);
        return () => window.removeEventListener("scroll", handelInfiniteScroll);
    }, [current_scroll_position, listloader, pre_scroll_position]);
    const handelInfiniteScroll = async () => {
        setCurrent_scroll_position((pre) => {
            return document.documentElement.scrollTop;
        });
        // console.clear();
        try {
            if ((window.innerHeight + document.documentElement.scrollTop + 1) > document.documentElement.scrollHeight) {
                if (currentpage < lastpage) {
                    if (!listloader) {
                        if (current_scroll_position > pre_scroll_position) {
                            let nextPage = currentpage === 1 ? 2 : currentpage + 1;
                            setcurrentpage(nextPage);
                            setPre_scroll_position(document.documentElement.scrollTop);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
            return false;
        }
    };
    async function AllUsers() {
        try {
            if (listloader) {
                return false;
            }
            setlistloader(true);
            setTimeout(async ()=>{
                let url = `${API_URL}/friend-rquest-already-send?page=${currentpage}&limit=${limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:''});
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
                        setDatelist((prev) => [...prev, ...data.result.list]);
                        // setDatelist((dataid) => { return data.result.list });
                        settotal_rec((dataid) => { return data.result.total });
                        setlastpage((dataid) => { return data.result.lastpage });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            },1000)
        } catch (error) {
            setlistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    async function SendRequest(row) {
        try {
            let url = `${API_URL}/send-request`;
            let myform = JSON.stringify({user_id:LOGIN_USER._id,to:row._id});
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            setdisabled_sendrequest(true);
            let response = await Post_With_Htoken(myform, url, headers);
            setdisabled_sendrequest(false);
            if(response!==""){
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    // let newdatalist = datalist.map(item => {
                    //     if (item._id === row._id) {
                    //         return {
                    //             ...item,
                    //             friend_request: data.friend_request[0],
                    //             check_friend_request:1,
                    //         };
                    //     }
                    //     return item;
                    // });
                      let newdatalist = datalist.filter(item => {
                        return item._id !== row._id;
                    });
                    setDatelist((prev) => {return newdatalist});
                    swal({
                        title: `Success`,
                        icon: "success",
                    })
                } else if (data.status == 300) {
                    let newdatalist = datalist.map(item => {
                        if (item._id === row._id) {
                            return {
                                ...item,
                                friend_request:data.friend_request[0],
                                check_friend_request:1,
                                is_friend:1,
                            };
                        }
                        return item;
                    });
                    setDatelist((prev) => {return newdatalist});
                    swal({
                        title: `Your alredy in friend list.`,
                        icon: "warning",
                    })
                } else if (data.status == 600) {
                    let newdatalist = datalist.map(item => {
                        if (item._id === row._id) {
                            return {
                                ...item,
                                friend_request:data.friend_request[0],
                                check_friend_request:1,
                            };
                        }
                        return item;
                    });
                    setDatelist((prev) => {return newdatalist});
                    swal({
                        title:`${data?.message}`,
                        icon: "warning",
                    })
                } else {
                    swal({
                        title: `${data?.message}`,
                        icon: "warning",
                    })
                }
            }
        } catch (error) {
            setdisabled_sendrequest(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    async function CencelRequest(to,requestid) {
        try {
            swal({
                title: "Are you sure?",
                // text: "Are you sure that you want to delete the recode?",
                icon: "warning",
                buttons: ["Cancel", "Yes"],
                dangerMode: true,
            }).then(async (d) => {
                if (d) {
                    let url = `${API_URL}/cencel-request`;
                    let myform = JSON.stringify({user_id:LOGIN_USER._id,to:to,'requestid':requestid});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    setdisabled_sendrequest(true);
                    let response = await Post_With_Htoken(myform, url, headers);
                    setdisabled_sendrequest(false);
                    if(response!==""){
                        response = await response.json();
                        const data = response;
                        if (data.status == 200) {
                            // let newdatalist = datalist.map(item => {
                            //     if (item._id === to) {
                            //         return {
                            //             ...item,
                            //             friend_request:null,
                            //             check_friend_request:0,
                            //             is_friend:0,
                            //         };
                            //     }
                            //     return item;
                            // });
                            let newdatalist = datalist.filter(item => {
                                return item._id!==to;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Success`,
                                icon: "success",
                            })
                        }else if (data.status == 300) {
                            // let newdatalist = datalist.map(item => {
                            //     if (item._id === to) {
                            //         return {
                            //             ...item,
                            //             is_friend:1,
                            //         };
                            //     }
                            //     return item;
                            // });
                            let newdatalist = datalist.filter(item => {
                                return item._id!==to;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Already accepted!`,
                                icon: "warning",
                            })
                        }else if (data.status == 600) {
                            // let newdatalist = datalist.map(item => {
                            //     if (item._id === to) {
                            //         return {
                            //             ...item,
                            //             friend_request:null,
                            //             check_friend_request:0,
                            //             is_friend:0,
                            //         };
                            //     }
                            //     return item;
                            // });
                            let newdatalist = datalist.filter(item => {
                                return item._id!==to;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Friend request rejected!`,
                                icon: "warning",
                            })
                        } else {
                            swal({
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    }
                }
                })
        } catch (error) {
            setdisabled_sendrequest(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    async function AcceptOrRejectRequest(row,status) {
        try {
            swal({
                title: "Are you sure?",
                // text: "Are you sure that you want to delete the recode?",
                icon: "warning",
                buttons: ["Cancel", "Yes"],
                dangerMode: true,
            }).then(async (d) => {
                if (d) {
                    let url = `${API_URL}/accept-or-reject-request`;
                    let myform = JSON.stringify({user_id:LOGIN_USER._id,from:row.friend_request.from, to:row.friend_request.to, requestid:row.friend_request._id, accept_status:status });
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    setdisabled_sendrequest(true);
                    let response = await Post_With_Htoken(myform, url, headers);
                    setdisabled_sendrequest(false);
                    if(response!==""){
                        response = await response.json();
                        const data = response;
                        if (data.status == 200) {
                            if(status==1){
                                let newdatalist = datalist.filter(item => {
                                    return item._id !== row._id;
                                });
                             setDatelist((prev) => {return newdatalist});
                            } else {
                                let newdatalist = datalist.map(item => {
                                    if (item._id === row.friend_request.from) {
                                        return {
                                            ...item,
                                            is_friend:1,
                                        };
                                    }
                                    return item;
                                });
                                setDatelist((prev) => {return newdatalist});
                            }
                            swal({
                                title: `Success`,
                                icon: "success",
                            })
                        }else if (data.status == 300) {
                            let newdatalist = datalist.map(item => {
                                if (item._id === row.friend_request.from) {
                                    return {
                                        ...item,
                                        friend_request:null,
                                        check_friend_request:0,
                                        is_friend:0,
                                    };
                                }
                                return item;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Request rejected by sender.`,
                                icon: "warning",
                            })
                        }else if (data.status == 600) {
                            let newdatalist = datalist.map(item => {
                                if (item._id === row.friend_request.from) {
                                    return {
                                        ...item,
                                        friend_request:null,
                                        check_friend_request:0,
                                        is_friend:0,
                                    };
                                }
                                return item;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Request has been rejected.`,
                                icon: "success",
                            })
                        } else {
                            swal({
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    }
                }
                })
        } catch (error) {
            setdisabled_sendrequest(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    async function RemoveFriend(row) {
        try {
            swal({
                title: "Are you sure?",
                // text: "Are you sure that you want to delete the recode?",
                icon: "warning",
                buttons: ["Cancel", "Yes"],
                dangerMode: true,
            }).then(async (d) => {
                if (d) {
                    let url = `${API_URL}/delete-friend`;
                    let myform = JSON.stringify({requestid:row.friend_request._id,user_id:LOGIN_USER._id});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    setdisabled_sendrequest(true);
                    let response = await Post_With_Htoken(myform, url, headers);
                    setdisabled_sendrequest(false);
                    if(response!==""){
                        response = await response.json();
                        const data = response;
                        if (data.status == 200) {
                             let newdatalist = datalist.map(item => {
                                if (item._id === row._id) {
                                    return {
                                        ...item,
                                        friend_request:null,
                                        check_friend_request:0,
                                        is_friend:0,
                                    };
                                }
                                return item;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Success.`,
                                icon: "success",
                            })
                        }else if (data.status == 300) {
                             let newdatalist = datalist.map(item => {
                                if (item._id === row._id) {
                                    return {
                                        ...item,
                                        friend_request:null,
                                        check_friend_request:0,
                                        is_friend:0,
                                    };
                                }
                                return item;
                            });
                            setDatelist((prev) => {return newdatalist});
                            swal({
                                title: `Not in friend list. May be already removed.`,
                                icon: "warning",
                            })
                        }else {
                            swal({
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    }
                }
                })
        } catch (error) {
            setdisabled_sendrequest(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    return (
       <>
        <div className="container-fluid">
            <div className="row">
            <div className="col-md-2">
                <Allnotifications/>
            </div>
            <div className="col-md-8 find-friends  mt-1">
                <h3 className='text-decoration-underline'>Friend Request Send List</h3>
             <div className='row'>
{datalist.map((item, index) =>
                <div className='col-md-3' key={index}>
                <div className="card m-2" >
                        <div className='image-div'>
                        {
                            item.user_file_dtl.filesize == "" ? 
                            <><img src='/images/image-not-found.png' className="card-img-top" title={item.title} loading="lazy"/></>
                                :  
                            <><img src={item.user_file_dtl.file_view_path} className="card-img-top" title={item.title} loading="lazy"/></>
                        }
                        </div>
                        <div className="card-body">
                        <h5 className="card-title">{item.name}</h5>
                        {/* <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p> */}
                        {
                        item.is_friend > 0 ? 
                        <><button type="button" onClick={() => RemoveFriend(item)}  className="btn btn-warning send-request" disabled={disabled_sendrequest?true:false} >Remove Friend</button></> 
                        :<>
                            {item.check_friend_request > 0 ? 
                                <>
                                {
                                    item.friend_request.from==LOGIN_USER._id?
                                    <>
                                    <button type="button" onClick={() => CencelRequest(item._id,item.friend_request._id)}  className="btn btn-secondary send-request" disabled={disabled_sendrequest?true:false} >Cencel Request</button>
                                    </>
                                    :
                                    <>
                                    <button type="button" onClick={() => AcceptOrRejectRequest(item,1)}  className="btn btn-info send-request" disabled={disabled_sendrequest?true:false} >Accept</button>
                                    <button type="button" onClick={() => AcceptOrRejectRequest(item,2)}  className="btn btn-danger send-request" disabled={disabled_sendrequest?true:false} >Reject</button>
                                    </>
                                }
                                </> 
                                : 
                                <><button type="button" onClick={() => SendRequest(item)}  className="btn btn-primary send-request" disabled={disabled_sendrequest?true:false} >Send Request</button></>
                            }
                        </>
                        }
                        

                        </div>
                    </div>
                </div>
)
}
             </div>
        {listloader==true ? <><Findfriendloader/></> : <></>}
            </div>
            <div className="col-md-2">
                <Userslist/>
            </div>
            </div>
        </div>
        </>
    )
}