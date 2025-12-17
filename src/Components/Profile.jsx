import './../Css/Profile.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { USER_DETAILS, API_URL,USER_LOGOUT,Truncatetext ,WEBSITE_URL} from './Constant.jsx';
 import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
 import moment from "moment";
 import { Pagination } from 'antd';
 import VideoCard from './VideoCard.jsx';
 import { Modal, Button,Form } from 'react-bootstrap';
 
 
 export default function Profile() {
  const firstCall = useRef(true);
  const firstCallcheck = useRef(true);
  const vfirstCallcheck = useRef(true);
  const pfirstCallcheck = useRef(true);
  const rfirstCallcheck = useRef(true);
  const mfirstCallcheck = useRef(true);
  const navigate = useNavigate();
  const LOGIN_USER = USER_DETAILS();

  const [c_tabe, setc_tabe] = useState('profile-friends');

  const [listloader, setlistloader] = useState(false);
  const [datalist, setDatelist] = useState([]);
  const [limit, setlimit] = useState(10);
  const [total_friend_rec, settotal_friend_rec] = useState(0);
  const [currentpage, setcurrentpage] = useState(1);


  const [videolistloader, setvideolistloader] = useState(false);
  const [videodatalist, setvideodatalist] = useState([]);
  const [videolimit, setvideolimit] = useState(10);
  const [total_video_rec, settotal_video_rec] = useState(0);
  const [videocurrentpage, setvideocurrentpage] = useState(1);

  const [photolistloader, setphotolistloader] = useState(false);
  const [photodatalist, setphotodatalist] = useState([]);
  const [photolimit, setphotolimit] = useState(10);
  const [total_photo_rec, settotal_photo_rec] = useState(0);
  const [photocurrentpage, setphotocurrentpage] = useState(1);

  const [reellistloader, setreellistloader] = useState(false);
  const [reeldatalist, setreeldatalist] = useState([]);
  const [reellimit, setreellimit] = useState(10);
  const [total_reel_rec, settotal_reel_rec] = useState(0);
  const [reelcurrentpage, setreelcurrentpage] = useState(1);

  const [musiclistloader, setmusiclistloader] = useState(false);
  const [musicdatalist, setmusicdatalist] = useState([]);
  const [musiclimit, setmusiclimit] = useState(10);
  const [total_music_rec, settotal_music_rec] = useState(0);
  const [musiccurrentpage, setmusiccurrentpage] = useState(1);


    let [search_name, setsearch_name] = useState('');
    const [disabled_sendrequest, setdisabled_sendrequest] = useState(false);
    useEffect(() => {
        document.title = "MERN Technology || User - Profile";
        // document.body.style.backgroundColor = "aliceblue";
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
        if (firstCall.current) {
              firstCall.current = false;
              return;
          }
          // MyFriends();
         EditRow(LOGIN_USER._id);
    }, []);

    useEffect(() => {
        if (firstCallcheck.current) {
              firstCallcheck.current = false;
              return;
          }
          MyFriends();
    }, [currentpage]);
    useEffect(() => {
        if (vfirstCallcheck.current) {
              vfirstCallcheck.current = false;
              return;
          }
          MyVideolist();
    }, [videocurrentpage]);
    useEffect(() => {
        if (pfirstCallcheck.current) {
              pfirstCallcheck.current = false;
              return;
          }
          MyPhotolist();
    }, [photocurrentpage]);
    useEffect(() => {
        if (rfirstCallcheck.current) {
              rfirstCallcheck.current = false;
              return;
          }
          MyReelslist();
    }, [reelcurrentpage]);
    useEffect(() => {
        if (mfirstCallcheck.current) {
              mfirstCallcheck.current = false;
              return;
          }
          MyMusiclist();
    }, [musiccurrentpage]);
    const [editdata,seteditdata] = useState({
    "_id": "",
    "wsstatus": 0,
    "name": "",
    "phone": 0,
    "email": "",
    "photo": "",
    "password": "",
    "active_status": 0,
    "file_dtl": {
        "filetype_st": "",
        "filetype": "",
        "filesize": 0,
        "filename": "",
        "file_path": "",
        "file_view_path": ""
    },
    "occupation": "",
    "skills": "",
    "dob": "",
    "country": "",
    "address": "",
    "about_us": "",
    "created_at": "",
    "updated_at": ""
    })
    const [total,settotal] = useState(0)
    async function EditRow(row) {
        try {
                let url = `${API_URL}/user-byid/${row}`;
                let myform = JSON.stringify({id:row});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                if(response!==""){
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    let blog = data.result.result;
                    // console.log(blog);
                    settotal((pre)=>{
                        return data.result.total;
                    });
                   if(data.result.total > 0){
                    seteditdata((pre)=>{
                        return blog;
                    });
                    seteditdata((pre)=>{
                        return {...pre,"file_view_path":blog.file_dtl.file_view_path};
                    });
                     
                   } else {
                        swal({
                            title: `Record not found!`,
                            icon: "warning",
                        })
                   }
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
  
 async function MyFriends() {
        try {
            if (listloader) {
                return false;
            }
            setlistloader(true);
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
                        setDatelist(data.result.list);
                        // setDatelist((dataid) => { return data.result.list });
                        settotal_friend_rec((dataid) => { return data.result.total });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            
        } catch (error) {
            setlistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

   function ChengeName(name){
    search_name=name;
    setsearch_name(name);
      setcurrentpage(1);
      setlimit(12);
      MyFriends();
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
                                //  let newdatalist = datalist.map(item => {
                                //     if (item._id === row._id) {
                                //         return {
                                //             ...item,
                                //             friend_request:null,
                                //             check_friend_request:0,
                                //             is_friend:0,
                                //         };
                                //     }
                                //     return item;
                                // });
                                // setDatelist((prev) => {return newdatalist});
                                let newdatalist = datalist.filter(item => {
                                    return item._id !== row._id;
                                });
                                setDatelist((prev) => {return newdatalist});
                                swal({
                                    title: `Success.`,
                                    icon: "success",
                                })
                            }else if (data.status == 300) {
                                //  let newdatalist = datalist.map(item => {
                                //     if (item._id === row._id) {
                                //         return {
                                //             ...item,
                                //             friend_request:null,
                                //             check_friend_request:0,
                                //             is_friend:0,
                                //         };
                                //     }
                                //     return item;
                                // });
                                // setDatelist((prev) => {return newdatalist});
                                 let newdatalist = datalist.filter(item => {
                                    return item._id !== row._id;
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


 async function MyVideolist() {
        try {
            if (videolistloader) {
                return false;
            }
            setvideolistloader(true);
                let url = `${API_URL}/my-blogs?page=${videocurrentpage}&limit=${videolimit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',blog_type:'691beef0c2cfd41cc117ef6f'});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setvideolistloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setvideodatalist(data.result.list);
                        settotal_video_rec((dataid) => { return data.result.total });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            
        } catch (error) {
            setvideolistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
     async function MyPhotolist() {
        try {
            if (photolistloader) {
                return false;
            }
            setphotolistloader(true);
                let url = `${API_URL}/my-blogs?page=${photocurrentpage}&limit=${photolimit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',blog_type:'691beef0c2cfd41cc117ef70'});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setphotolistloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setphotodatalist(data.result.list);
                        settotal_photo_rec((dataid) => { return data.result.total });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            
        } catch (error) {
            setphotolistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    async function MyReelslist() {
        try {
            if (reellistloader) {
                return false;
            }
            setreellistloader(true);
                let url = `${API_URL}/my-blogs?page=${reelcurrentpage}&limit=${reellimit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',blog_type:'691beef0c2cfd41cc117ef6e'});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setreellistloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setreeldatalist(data.result.list);
                        settotal_reel_rec((dataid) => { return data.result.total });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            
        } catch (error) {
            setreellistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    async function MyMusiclist() {
        try {
            if (musiclistloader) {
                return false;
            }
            setmusiclistloader(true);
                let url = `${API_URL}/my-blogs?page=${musiccurrentpage}&limit=${musiclimit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',blog_type:'691beef0c2cfd41cc117ef71'});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setmusiclistloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setmusicdatalist(data.result.list);
                        settotal_music_rec((dataid) => { return data.result.total });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
            
        } catch (error) {
            setmusiclistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
     function BlogDetails(row){
         navigate(`/web/blog-details/${row.content_alias}`);
         return true;
    }   







async function LikeAndDislike(item) {
        try {
            let status = item.mylike <= 0 ? 1 : 0;
            setactionloader(true);
           let url = `${API_URL}/like-and-dislike`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:item._id,status:status});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setactionloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                        if (row._id === item._id) {
                            return {
                                ...row,
                                mylike:status,
                                total_likes: data.total
                            };
                        }
                        return row;
                    });
                    setDatelist((prev) => {return newdatalist});
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
        } catch (error) {
            setactionloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
 
    let comment_blog_details = useRef(false);
    const [comment_form, setcomment_form] = useState({
        comment:'',
        user_id:'',
        blog_id:'',
        comment:'',
        _id:'',
    });
    const [actionloader, setactionloader] = useState(false);
    const [comment_actionloader, setcomment_actionloader] = useState(false);
    const [showcomment_modal, setshowcomment_modal] = useState(false);
    const [comment_listloader, setcomment_listloader] = useState(false);
    const [comment_datalist, setcomment_datalist] = useState([]);
    const [comment_limit, setcomment_limit] = useState(5);
    const [comment_total_rec, setcomment_total_rec] = useState(0);
    let [comment_currentpage, setcomment_currentpage] = useState(1);
    const [comment_lastpage, setcomment_lastpage] = useState(1);

    async function OpenComment(item) {
        try {
            setactionloader(true);
            setcomment_form(pre => ({
                ...pre,
                comment: '',
                user_id:LOGIN_USER._id,
                blog_id:item._id,
                _id:'',
            }))
            comment_blog_details.current = item;
            CommentList();
            setshowcomment_modal(true);
        } catch (error) {
            setactionloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
 
    async function Comment() {
        try {
            let status = 1;
            if(comment_form._id!==''){
                status=2;
            }
            setcomment_actionloader(true);
           let url = `${API_URL}/blog-comment`;
                let myform = JSON.stringify({user_id:comment_form.user_id,blog_id:comment_form.blog_id,status:status,comment:comment_form.comment,comment_id:comment_form._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setcomment_actionloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                        if (row._id === comment_blog_details.current._id) {
                            return {
                                ...row,
                                mycomment:data.mytotal,
                                total_comments: data.total,
                            };
                        }
                        return row;
                    });
                    setDatelist((prev) => {return newdatalist});
                    setcomment_form(pre =>{ 
                        return { ...pre, comment: '', _id:''}
                    })
                    if(comment_form._id==''){
                        setcomment_datalist((prev) => [data.result,...prev]);
                        setcomment_total_rec((dataid) => { return data.total });
                    } else {
                        // setcomment_datalist((prev) => prev.filter(item => item._id !== comment_form._id));
                        // setcomment_datalist((prev) => [data.result,...prev]);

                        let newdatalist = comment_datalist.map(row => {
                        if (row._id === comment_form._id) {
                                return {
                                    ...row,
                                    ...data.result
                                };
                            }
                            return row;
                        });
                        setcomment_datalist((prev) => {return newdatalist});

                    }
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
        } catch (error) {
            setcomment_actionloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    function commentPagechange(){
        comment_currentpage = comment_currentpage+1;
        setcomment_currentpage((pre)=>{return comment_currentpage;});
        CommentList();
    }
    async function CommentList() {
        try {
            if (comment_listloader) {
                return false;
            }
            // setcomment_currentpage((pre)=>{
            //     return pre;
            // });
            setcomment_listloader(true);
             setTimeout(async ()=>{
            let url = `${API_URL}/blog-comment-list?page=${comment_currentpage}&limit=${comment_limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:comment_blog_details.current._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setcomment_listloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                            if (row._id === comment_blog_details.current._id) {
                                return {
                                    ...row,
                                    mycomment:data.mytotal,
                                    total_comments: data.result.total,
                                };
                            }
                            return row;
                        });
                        setDatelist((prev) => {return newdatalist});
                        setcomment_datalist((prev) => [...prev, ...data.result.docs]);
                        setcomment_total_rec((dataid) => { return data.result.total });
                        setcomment_lastpage((dataid) => { return data.result.totalpage });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },500)
        } catch (error) {
            setcomment_listloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    function closemodal(){
        setshowcomment_modal(false);
        setcomment_currentpage(1);
        setcomment_lastpage(1);
        setcomment_datalist((prev) => {return [];});
        setactionloader(false);
    }
    const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // console.log(scrollTop, scrollHeight, clientHeight);
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            // console.log("Reached bottom!");
            if (comment_currentpage < comment_lastpage) {
                commentPagechange();
            }
        }
    };
    const editComments = (item) => {
        setcomment_form(pre => ({
            ...pre,
            comment: item.comment,
            user_id:item.user_id,
            blog_id:item.blog_id,
            comment:item.comment,
            _id:item._id,
        }))
    };
    const deleteComments = (comment_) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this comment!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(async (willDelete) => {
            if (willDelete) {
                let url = `${API_URL}/blog-comment`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:comment_.blog_id,status:0,comment:'-',comment_id:comment_._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                        if (row._id === comment_.blog_id) {
                                return {
                                    ...row,
                                    mycomment:data.mytotal,
                                    total_comments: data.total
                                };
                            }
                            return row;
                        });
                        setDatelist((prev) => {return newdatalist});
                        setcomment_datalist((prev) => prev.filter(item => item._id !== comment_._id));
                        setcomment_total_rec((dataid) => { return data.total });
                        swal({
                            title: `${data?.message}`,
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
        });
    };






    return (
        <>
            <div className="container profile">
  <div id="content" className="content p-0">
    <div className="profile-header">
      <div className="profile-header-cover" />
      <div className="profile-header-content">
        <div className="profile-header-img mb-4">
          {total > 0 ?
          editdata.file_dtl.filetype!=='' ? 
          <><img src={editdata.file_dtl.file_view_path} className="mb-4" alt={total > 0 ? editdata.name : ''} /></> 
          : 
          <><img src="/images/image-not-found.png" className="mb-4" alt={total > 0 ? editdata.name : ''} /></>
          : 
          <><img src="/images/image-not-found.png" className="mb-4" alt={total > 0 ? editdata.name : ''} /></>
          }
          
        </div>
        <div className="profile-header-info">
          <h4 className="m-t-sm">{total > 0 ? editdata.name : ''}</h4>
          <p className="m-b-sm">{total > 0 ? editdata.occupation : ''}</p>
          <Link to="/web/edit-profile" className="btn btn-xs btn-primary mb-2">
            Edit Profile
          </Link>
        </div>
      </div>
      <ul className="profile-header-tab nav nav-tabs">
        <li className="nav-item">
          <a 
          href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('about-us');
            }}
          className={c_tabe=='about-us' ? 'nav-link active show' : 'nav-link'}
          data-toggle="tab">
            ABOUT
          </a>
        </li>
        <li className="nav-item">
          <a 
          href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('my-photo');
            }}
          className={c_tabe=='my-photo' ? 'nav-link active show' : 'nav-link'}
          data-toggle="tab">
            PHOTOS
          </a>
        </li>
        <li className="nav-item">
          <a 
          href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('my-video');
            }}
             className={c_tabe=='my-video' ? 'nav-link active show' : 'nav-link'}
             data-toggle="tab">
            VIDEOS
          </a>
        </li>
        <li className="nav-item">
          <a href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('my-post');
            }}
            className={c_tabe=='my-post' ? 'nav-link active show' : 'nav-link'}
           data-toggle="tab">
            REELS
          </a>
        </li>
        <li className="nav-item">
          <a href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('my-music');
            }}
            className={c_tabe=='my-music' ? 'nav-link active show' : 'nav-link'}
           data-toggle="tab">
            MUSIC
          </a>
        </li>
        <li className="nav-item">
          <a
             href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('profile-friends');
            }}
            className={c_tabe=='profile-friends' ? 'nav-link active show' : 'nav-link'}
            data-toggle="tab"
          >
            FRIENDS
          </a>
        </li>
      </ul>           
    </div>
    <div className="profile-container">
      <div className="row row-space-20">
        <div className="col-md-8">
          <div className="tab-content p-0">

            <div className={c_tabe=='about-us' ? 'tab-pane fade active show' : 'tab-pane fade'} id="about-us">
              <div className="m-b-10 text-dark">
                <b>About Us</b>
              </div>
              <div className='text-dark' dangerouslySetInnerHTML={{ __html: total > 0 ? editdata.about_us : '' }} />
            </div>

            <div className={c_tabe=='my-photo' ? 'tab-pane fade active show blog' : 'tab-pane fade blog'} id="my-photo">
                           <div className="m-b-10 text-dark">
                <b>Photos ({total_photo_rec})</b>
              </div>
               
 {photodatalist.map((item, index) => 
              <section key={index}>
              <h3 title={item.title} className='blog-title'><Truncatetext text={item.title} maxLength={110} /></h3>
                <div className='blog-image'>
              {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                  item.file_dtl.filesize == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/></>
                      :  
                  <><img src={item.file_dtl.file_view_path} title={item.title} loading="lazy"/></>
              : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></> 
              : 
              <></> 
              }
              </div>
              <div className="user">
                  {item.user_file_dtl.filesize == "" ? 
                  <><img src='/images/no-profile-picture-15257.png' loading="lazy"/></>
                      :  
                  <><img src={item.user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                  }
                  <div className="user-info">
                  <h5>{item.user_name}</h5>
                  <p className="date">{moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                  </div>
              </div>
              <div className='sort-desc'>
                  <Truncatetext text={item.sort_description} maxLength={200} />
              </div>
              <a href="" 
                onClick={(e) => {
                  e.preventDefault();
                  BlogDetails(item);
              }}
              >Read More</a>
              <div className="fb-actions">
                {/* onClick={()=>LikeAndDislike(item)}  */}
                        <button className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                            <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                        </button>
                        <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                        </button>
                        <button className="fb-btn share " type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-share"></i> Share
                        </button>
                        </div>
              </section>   
 )}
              
<div className='container ff-p mt-2'>
<Pagination pageSize={photolimit} total={total_photo_rec} current={photocurrentpage} onChange={(value) => setphotocurrentpage(value)} showQuickJumper={false} />
</div>
            </div>

             <div className={c_tabe=='my-video' ? 'tab-pane fade active show blog' : 'tab-pane fade blog'} id="my-video">
              <div className="m-b-10 text-dark">
                <b>Videos ({total_video_rec})</b>
              </div>
               
 {videodatalist.map((item, index) => 
              <section key={index}>
              <h3 title={item.title} className='blog-title'><Truncatetext text={item.title} maxLength={110} /></h3>
                <div className='blog-image'>
              {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                  item.file_dtl.filesize == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/></>
                      :  
                  <><img src={item.file_dtl.file_view_path} title={item.title} loading="lazy"/></>
              : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></> 
              : 
              <></> 
              }
              </div>
              <div className="user">
                  {item.user_file_dtl.filesize == "" ? 
                  <><img src='/images/no-profile-picture-15257.png' loading="lazy"/></>
                      :  
                  <><img src={item.user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                  }
                  <div className="user-info">
                  <h5>{item.user_name}</h5>
                  <p className="date">{moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                  </div>
              </div>
              <div className='sort-desc'>
                  <Truncatetext text={item.sort_description} maxLength={200} />
              </div>
              <a href="" 
                onClick={(e) => {
                  e.preventDefault();
                  BlogDetails(item);
              }}
              >Read More</a>
              <div className="fb-actions">
                 {/* onClick={()=>LikeAndDislike(item)}  */}
                        <button className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                            <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                        </button>
                        <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                        </button>
                        <button className="fb-btn share " type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-share"></i> Share
                        </button>
                        </div>
              </section>   
 )}
              
<div className='container ff-p mt-2'>
<Pagination pageSize={videolimit} total={total_video_rec} current={videocurrentpage} onChange={(value) => setvideocurrentpage(value)} showQuickJumper={false} />
</div>
            </div>

            <div className={c_tabe=='my-post' ? 'tab-pane fade active show blog' : 'tab-pane fade blog'} id="my-post">
              <div className="m-b-10 text-dark">
                <b>Reels ({total_reel_rec})</b>
              </div>
               
 {reeldatalist.map((item, index) => 
              <section key={index}>
              <h3 title={item.title} className='blog-title'><Truncatetext text={item.title} maxLength={110} /></h3>
                <div className='blog-image'>
              {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                  item.file_dtl.filesize == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/></>
                      :  
                  <><img src={item.file_dtl.file_view_path} title={item.title} loading="lazy"/></>
              : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></> 
              : 
              <></> 
              }
              </div>
              <div className="user">
                  {item.user_file_dtl.filesize == "" ? 
                  <><img src='/images/no-profile-picture-15257.png' loading="lazy"/></>
                      :  
                  <><img src={item.user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                  }
                  <div className="user-info">
                  <h5>{item.user_name}</h5>
                  <p className="date">{moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                  </div>
              </div>
              <div className='sort-desc'>
                  <Truncatetext text={item.sort_description} maxLength={200} />
              </div>
              <a href="" 
                onClick={(e) => {
                  e.preventDefault();
                  BlogDetails(item);
              }}
              >Read More</a>
              <div className="fb-actions">
                {/* onClick={()=>LikeAndDislike(item)}  */}
                        <button className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                            <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                        </button>
                        <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                        </button>
                        <button className="fb-btn share " type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-share"></i> Share
                        </button>
                        </div>
              </section>   
 )}
              
<div className='container ff-p mt-2'>
<Pagination pageSize={reellimit} total={total_reel_rec} current={reelcurrentpage} onChange={(value) => setreelcurrentpage(value)} showQuickJumper={false} />
</div>
            </div>

            <div className={c_tabe=='my-music' ? 'tab-pane fade active show blog' : 'tab-pane fade blog'} id="my-music">
              <div className="m-b-10 text-dark">
                <b>Music ({total_music_rec})</b>
              </div>
               
 {musicdatalist.map((item, index) => 
              <section key={index}>
              <h3 title={item.title} className='blog-title'><Truncatetext text={item.title} maxLength={110} /></h3>
                <div className='blog-image'>
              {item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
                  item.file_dtl.filesize == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/></>
                      :  
                  <><img src={item.file_dtl.file_view_path} title={item.title} loading="lazy"/></>
              : item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></>
              : item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
                  item.file_dtl.file_view_path == "" ? 
                  <><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/>1</>
                      :  
                  <><VideoCard key={item._id} blog={{ thumbnail_view_path:item.thumbnail_dtl.file_view_path, title:item.title, content_alias:item.content_alias}}/></> 
              : 
              <></> 
              }
              </div>
              <div className="user">
                  {item.user_file_dtl.filesize == "" ? 
                  <><img src='/images/no-profile-picture-15257.png' loading="lazy"/></>
                      :  
                  <><img src={item.user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                  }
                  <div className="user-info">
                  <h5>{item.user_name}</h5>
                  <p className="date">{moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                  </div>
              </div>
              <div className='sort-desc'>
                  <Truncatetext text={item.sort_description} maxLength={200} />
              </div>
              <a href="" 
                onClick={(e) => {
                  e.preventDefault();
                  BlogDetails(item);
              }}
              >Read More</a>
              <div className="fb-actions">
                {/* onClick={()=>LikeAndDislike(item)}  */}
                        <button className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                            <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                        </button>
                        <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                        </button>
                        <button className="fb-btn share " type='button' disabled={actionloader?true:false}>
                            <i className="bi bi-share"></i> Share
                        </button>
                        </div>
              </section>   
 )}
              
<div className='container ff-p mt-2'>
<Pagination pageSize={musiclimit} total={total_music_rec} current={musiccurrentpage} onChange={(value) => setmusiccurrentpage(value)} showQuickJumper={false} />
</div>
            </div>

            <div className={c_tabe=='profile-friends' ? 'tab-pane fade active show' : 'tab-pane fade'} id="profile-friends">
              <div className="m-b-10 text-dark">
                <b>Friend List ({total_friend_rec})</b> <input type="text" id='search_name' placeholder='Search Name' onKeyUp={(e)=>{ChengeName(e.target.value)}} />
              </div>
              <ul className="friend-list clearfix">
 {datalist.map((item, index) => 
                <li key={index}>
                  <a href="#">
                    <div className="friend-img">
                      {
                        item.user_file_dtl.filename == "" ? 
                        <><img src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.name}  alt={item.name} loading="lazy"/></>
                            :  
                        <><img src={item.user_file_dtl.file_view_path} title={item.name}  alt={item.name} loading="lazy"/></>
                    }
                    </div>
                    <div className="friend-info">
                      <h4>{item.name}</h4>
                      <p>{item.total_friend} friends</p>
                      <button disabled={disabled_sendrequest?true : false} type="button" onClick={() => RemoveFriend(item)}  className="btn btn-warning">Remove</button>
                      <button disabled={disabled_sendrequest?true : false} type="button" className="btn btn-primary ml-4">View Profile</button>
                    </div>
                  </a>
                </li>
 )}
              </ul>
<div className='container ff-p mt-2'>
<Pagination pageSize={limit} total={total_friend_rec} current={currentpage} onChange={(value) => setcurrentpage(value)} showQuickJumper={false} />
</div>


            </div>


           
          </div>
        </div>
        <div className="col-md-4 hidden-xs hidden-sm">
          <ul className="profile-info-list">
            <li className="title">PERSONAL INFORMATION</li>
            <li>
              <div className="field">Occupation:</div>
              <div className="value">{total > 0 ? editdata.occupation : ''}</div>
            </li>
            <li>
              <div className="field">Skills:</div>
              <div className="value">{total > 0 ? editdata.skills : ''}</div>
            </li>
            <li>
              <div className="field">Birth of Date:</div>
              <div className="value">{total > 0 ? editdata.dob!==null ? moment(editdata.dob).format("DD/MMM/YYYY"):'' : ''}</div>
            </li>
            <li>
              <div className="field">Country:</div>
              <div className="value">{total > 0 ? editdata.country : ''}</div>
            </li>
            <li>
              <div className="field">Address:</div>
              <div className="value">
                <address className="m-b-0">{total > 0 ? editdata.address : ''}</address>
              </div>
            </li>
            <li>
              <div className="field">Phone No:</div>
              <div className="value">{total > 0 ? editdata.phone : ''}</div>
            </li>
          
            
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<Modal 
                show={showcomment_modal} 
                onHide={() => closemodal()}
                backdrop="static"  
                keyboard={false}  
                    >
                    <Modal.Header closeButton>
                    <Modal.Title>Comments({comment_total_rec})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <Form onSubmit={(e)=>{
                            e.preventDefault();
                            Comment();
                        }}>
                            <Form.Group className="mb-3">
                                <Form.Label>Your Comment</Form.Label>
                                <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Write your comment..."
                                value={comment_form.comment}
                                  onChange={(e) => setcomment_form(pre => ({
                                    ...pre,
                                    comment: e.target.value
                                }))}
                                required
                                />
                            </Form.Group>

                   
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                variant="secondary"
                                onClick={() => closemodal()}
                                >
                                Cancel
                                </Button>
 
                                
                                {comment_form._id=="" ? 
                                <><Button variant="primary" type="submit" disabled={comment_actionloader == true ? true:false}>Post Comment</Button></>
                                 : 
                                 <><Button variant="warning" type="submit" disabled={comment_actionloader == true ? true:false}>Update Comment</Button></>
                                 }
                                
                            </div>
                            </Form> */}
                   
<div className='profile-comments container'>
 <div className="comments-section" onScroll={handleScroll}>
  {comment_listloader && (
    <h4 className="text-center">Loading..</h4>
  )}

  {comment_datalist.map((item, index) => (
    <div className="comment" key={index}>
      <img
        className="avatar"
        src={
          item.user_file_view_path
            ? item.user_file_view_path
            : `${WEBSITE_URL}/images/image-not-found.png`
        }
        title={item.user_name}
        loading="lazy"
      />

      <div className="comment-body">
        <div className="comment-box">
          
          <div className="comment-header">
            <span className="username">{item.user_name}</span>
            {
                item.user_id === LOGIN_USER._id ? <>
            <div className="comment-icons">
              <i
                className="bi bi-pencil-square"
                title="Edit"
                onClick={() => editComments(item)}
              ></i>
              <i
                className="bi bi-trash"
                title="Delete"
                onClick={() => deleteComments(item)}
              ></i>
            </div>
            </> : <></>
            }
          </div>

          <p className="comment-text">
            {item.comment}
            <br />
            <small>
              {item.updated_at ?? item.created_at}
            </small>
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

<div className='spinner-div'>
{
    comment_listloader == true ? 
    <>
        <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
        </div>
    </> 
    : 
    <></>
}
</div>
</div>
        {/* {comment_currentpage < comment_lastpage ? 
        <>
        <button className='btn btn-sm btn-primary' disabled={comment_listloader == true ? true:false} onClick={()=>commentPagechange()} type="button">
            {
            comment_listloader == true ? 
            <>
            <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
            </div>
            </> 
            : 
            <>Load More</>
            }
        </button>
        </>
        :
        <></>
        } */}
        {/* <Pagination pageSize={comment_limit} total={comment_total_rec} current={comment_currentpage} onChange={(value) => commentPagechange(value)} showQuickJumper /> */}           
          </Modal.Body>
                    {/* <Modal.Footer></Modal.Footer>            */}
                </Modal>
 
        </>
    );
}