import './../Css/Home.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext,decrypt,encrypt,WEBSITE_URL } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
import Allnotifications from './Allnotifications.jsx';
import VideoCard from './VideoCard.jsx';
import { Modal, Button,Form } from 'react-bootstrap';
 
function Blogdetails(){
    const { id } = useParams();
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(5);
    const [total_rec, settotal_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    const [current_scroll_position, setCurrent_scroll_position] = useState(0);
    const [pre_scroll_position, setPre_scroll_position] = useState(0);
    useEffect(() => {
            document.title = "MERN Technology || Blogs";
            if (LOGIN_USER === false) {
                navigate('/');
                return;
            }
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            Allblogs();
        }, [currentpage]);

    //  useEffect(() => {
    //     window.addEventListener("scroll", handelInfiniteScroll);
    //     return () => window.removeEventListener("scroll", handelInfiniteScroll);
    // }, [current_scroll_position, listloader, pre_scroll_position]);
    // const handelInfiniteScroll = async () => {
    //     setCurrent_scroll_position((pre) => {
    //         return document.documentElement.scrollTop;
    //     });
    //     // console.clear();
    //     try {
    //         if ((window.innerHeight + document.documentElement.scrollTop + 1) > document.documentElement.scrollHeight) {
    //             if (currentpage < lastpage) {
    //                 if (!listloader) {
    //                     if (current_scroll_position > pre_scroll_position) {
    //                         let nextPage = currentpage === 1 ? 2 : currentpage + 1;
    //                         setcurrentpage(nextPage);
    //                         setPre_scroll_position(document.documentElement.scrollTop);
    //                     }
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //         return false;
    //     }
    // };
    async function Allblogs() {
        try {
            if (listloader) {
                return false;
            }
            setlistloader(true);
            setTimeout(async ()=>{
                let url = `${API_URL}/blog-byalias/${id}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,id:id});
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
                        if( data.result.total > 0){
                            setDatelist((pre)=>{
                                return data.result.result;
                            });
                        }
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
    
    function changePage(page){
        setcurrentpage(page)
    }
    function BlogDetails(row){
         navigate(`/web/blog-details/${row.content_alias}`);
         return true;
    }

    async function LikeAndDislike(item) {
        try {
            let status = item.my_total_notsharelike <= 0 ? 1 : 0;
            setactionloader(true);
           let url = `${API_URL}/like-and-dislike`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:item._id,status:status,blog_post_by:item.user_id});
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
                            if(item.is_shared_blog){
                                return {
                                    ...row,
                                    mylike:status,
                                    total_likes: data.total
                                };
                            } else {
                                return {
                                    ...row,
                                    my_total_notsharelike:status,
                                    total_likes: data.total
                                };
                            }
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
        blog_post_by:'',
        shared_blog_id:'',
        is_shared_blog:'',
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
            console.log(item);
            setactionloader(true);
            setcomment_form(pre => ({
                ...pre,
                comment: '',
                user_id:LOGIN_USER._id,
                blog_id:item._id,
                blog_post_by:item.user_id,
                shared_blog_id:item.shared_blog_id,
                is_shared_blog:item.is_shared_blog,
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
                let myform = JSON.stringify({user_id:comment_form.user_id,
                    blog_id:comment_form.blog_id,
                    status:status,
                    comment:comment_form.comment,
                    comment_id:comment_form._id,
                    blog_post_by:comment_form.user_id,
                    shared_blog_id:comment_form.shared_blog_id,
                });
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
                                my_total_notsharecomment:1,
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

    async function CommentOnSharePost() {
        try {
            let status = 1;
            if(comment_form._id!==''){
                status=2;
            }
            setcomment_actionloader(true);
           let url = `${API_URL}/comment-on-sharepost`;
                let myform = JSON.stringify({user_id:comment_form.user_id,
                    blog_id:comment_form.blog_id,
                    status:status,
                    comment:comment_form.comment,
                    comment_id:comment_form._id,
                    blog_post_by:comment_form.user_id,
                    shared_blog_id:comment_form.shared_blog_id,
                });
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
            blog_post_by:comment_form.user_id,
            shared_blog_id:comment_form.shared_blog_id,
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
                                    total_comments: data.total,
                                    my_total_notsharecomment: data.my_total_notsharecomments
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
    
    
const sharepost_form = useRef(null);
const [loding_share_topublic, setloding_share_topublic] = useState(false);
const [showshare_postmodal, setshowshare_postmodal] = useState(false);
const [sharepost_friendlistloader, setsharepost_friendlistloader] = useState(false);
const [sharepost_friendlist, setsharepost_friendlist] = useState([]);
const [sharepost_limit, setsharepost_limit] = useState(5);
const [sharepost_total_rec, setsharepost_total_rec] = useState(0);
let [sharepost_currentpage, setsharepost_currentpage] = useState(1);
let [sharepost_lastpage, setsharepost_lastpage] = useState(1);   
const selectedusers = useRef(new Map());
   function closesharepostmodal(){
        setshowshare_postmodal(false);
        setsharepost_currentpage(1);
        setsharepost_lastpage(1);
        setsharepost_friendlist((prev) => {return [];});
        setactionloader(false);
        setloding_share_topublic(false);
        selectedusers.current=new Map();
    }
     const handlesharePostScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // console.log(scrollTop, scrollHeight, clientHeight);
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            // console.log("Reached bottom!");
            if (sharepost_currentpage < sharepost_lastpage) {
                sharePostPagechange();
            }
        }
    };
    function sharePostPagechange(){
        sharepost_currentpage = sharepost_currentpage+1;
        setsharepost_currentpage((pre)=>{return sharepost_currentpage;});
        SharePostFriendList();
    }

async function OpenShareModal(item) {
    sharepost_form.current=item;
    setshowshare_postmodal(true);
    setsharepost_currentpage(1);
    setsharepost_lastpage(1);
    setsharepost_friendlist((prev) => {return [];});
    setactionloader(true);
    SharePostFriendList();
    setloding_share_topublic(false);
    selectedusers.current=new Map();
}

        async function SharePostFriendList() {
        try {
            if (sharepost_friendlistloader) {
                return false;
            }
           
            setsharepost_friendlistloader(true);
             setTimeout(async ()=>{
                let url = `${API_URL}/my-friends-for-share?page=${sharepost_currentpage}&limit=${sharepost_limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,name:'',blog_id:sharepost_form.current._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setsharepost_friendlistloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                            if (row._id === sharepost_form.current._id) {
                                return {
                                    ...row,
                                    my_shares:data.mytotal,
                                    total_shares: data.total_share,
                                };
                            }
                            return row;
                        });
                        setDatelist((prev) => {return newdatalist});

                        let users = data.result.list.map(row => {
                            if (row._id === sharepost_form.current._id) {
                                return {
                                    ...row,
                                    is_selected:false,
                                };
                            }
                            return row;
                        });
                        setsharepost_friendlist((prev) => [...prev, ...users]);
                        setsharepost_total_rec((dataid) => { return data.result.total });
                        setsharepost_lastpage((dataid) => { return data.result.totalpage });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },500)
        } catch (error) {
            setsharepost_friendlistloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
async function ShareToPublic() {
    ShareBlog();
}

async function ShareBlog() {
        try {
            if (loding_share_topublic) {
                return false;
            }
            setloding_share_topublic(true);
             setTimeout(async ()=>{
            let url = `${API_URL}/share-blog`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:sharepost_form.current._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setloding_share_topublic(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        swal({
                            title: `Success`,
                            icon: "success",
                        });
                        let newdatalist = datalist.map(row => {
                        if (row._id === sharepost_form.current._id) {
                            return {
                                ...row,
                                total_shares:data.total_shares,
                                my_shares: data.my_shares
                            };
                        }
                        return row;
                    });
                    setDatelist((prev) => {return newdatalist});
                    closesharepostmodal();
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },500)
        } catch (error) {
            setloding_share_topublic(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    
    function selectthisuser(user){
        if(selectedusers.current.has(user._id)){
            selectedusers.current.delete(user._id);
            let users = sharepost_friendlist.map(row => {
                if (row._id === user._id) {
                    return {
                        ...row,
                        is_selected:false,
                    };
                }
                return row;
            });
            setsharepost_friendlist((prev) => {return users});
        } else{
            selectedusers.current.set(user._id,user);
            let users = sharepost_friendlist.map(row => {
                if (row._id === user._id) {
                    return {
                        ...row,
                        is_selected:true,
                    };
                }
                return row;
            });
            setsharepost_friendlist((prev) => {return users});
        }
    }
async function ShareToFriends() {
    if(selectedusers.current.size > 0){
        ShareBlogToFriend();
    } else {
        swal({
            title: `Please select friend!`,
            icon: "warning",
        })
    }
}

async function ShareBlogToFriend() {
        try {
            if (loding_share_topublic) {
                return false;
            }
            let users = [...selectedusers.current.keys()];
            setloding_share_topublic(true);
             setTimeout(async ()=>{
            let url = `${API_URL}/share-blog-to-friends`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:sharepost_form.current._id,selected_user:users});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setloding_share_topublic(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        swal({
                            title: `Success`,
                            icon: "success",
                        });
                        let newdatalist = datalist.map(row => {
                        if (row._id === sharepost_form.current._id) {
                            return {
                                ...row,
                                total_shares:data.total_shares,
                                my_shares: data.my_shares
                            };
                        }
                        return row;
                    });
                    setDatelist((prev) => {return newdatalist});
                    closesharepostmodal();
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },500)
        } catch (error) {
            setloding_share_topublic(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    async function LikeAndDislikeOnSharePost(item) {
        try {
            let status = item.mylike <= 0 ? 1 : 0;
            setactionloader(true);
           let url = `${API_URL}/like-and-dislike-on-sharepost`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:item._id,status:status,shared_blog_id:item.shared_blog_id});
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

    const share_form = useRef(null);
    const [showshare_modal, setshowshare_modal] = useState(false);
    const [share_listloader, setshare_listloader] = useState(false);
    const [share_datalist, setshare_datalist] = useState([]);
    const [share_limit, setshare_limit] = useState(5);
    const [share_total_rec, setshare_total_rec] = useState(0);
    let [share_currentpage, setshare_currentpage] = useState(1);
    let [share_lastpage, setshare_lastpage] = useState(1);
    function OpenShareList(item) {
        try {
            setactionloader(true);
            share_form.current=(item);
            ShareList();
            setshowshare_modal(true);
        } catch (error) {
            setactionloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    async function ShareList() {
        try {
            if (share_listloader) {
                return false;
            }
           
            setshare_listloader(true);
             setTimeout(async ()=>{
            let url = `${API_URL}/blog-share-list?page=${share_currentpage}&limit=${share_limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:share_form.current._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setshare_listloader(false);
                if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        let newdatalist = datalist.map(row => {
                            if (row._id === share_form.current._id) {
                                return {
                                    ...row,
                                    my_shares:data.mytotal,
                                    total_shares: data.result.total,
                                };
                            }
                            return row;
                        });
                        setDatelist((prev) => {return newdatalist});
                        setshare_datalist((prev) => [...prev, ...data.result.docs]);
                        setshare_total_rec((dataid) => { return data.result.total });
                        setshare_lastpage((dataid) => { return data.result.totalpage });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                },500)
        } catch (error) {
            setshare_listloader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    function closesharemodal(){
        setshowshare_modal(false);
        setshare_currentpage(1);
        setshare_lastpage(1);
        setshare_datalist((prev) => {return [];});
        setactionloader(false);
    }
    const handleshareScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // console.log(scrollTop, scrollHeight, clientHeight);
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            // console.log("Reached bottom!");
            if (share_currentpage < share_lastpage) {
                sharePagechange();
            }
        }
    };
    function sharePagechange(){
        share_currentpage = share_currentpage+1;
        setcomment_currentpage((pre)=>{return share_currentpage;});
        ShareList();
    }
    return (
        <>
        <div className="container-fluid">
            <div className="row">
            <div className="col-md-3">
               <Allnotifications/>
            </div>
            <div className="col-md-6 blog">
            {datalist.map((item, index) =>
            <div className='' key={index}>
            {
                item.is_shared_blog ?
               <div className="shared-post" key={index}>
                    <div className="shared-header">
                        <i className="bi bi-share" />
                        <b>Shared by {item.user_name} on {moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</b>
                    </div>
                    <section>
                       <h3 title={item.share_title} className='blog-title'><Truncatetext text={item.share_title} maxLength={110} /></h3>
                        <div className="blog-image">
                            <div className='blog-image'>
                        {/* forvideos */}
{item.share_category_type == "691beef0c2cfd41cc117ef70" ? //photo
item.share_file_dtl.filesize == "" ? 
<><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.title} loading="lazy"/></>
:  
<><img src={item.share_file_dtl.file_view_path} title={item.share_title} loading="lazy"/></>
: item.share_category_type == "691beef0c2cfd41cc117ef71"  ? //music
item.share_file_dtl.file_view_path == "" ? 
<><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.share_title} loading="lazy"/>1</>
:  
<><VideoCard key={item._id} blog={{ thumbnail_view_path:item.share_thumbnail_dtl.file_view_path, title:item.share_title, content_alias:item.share_content_alias}}/></>
: item.share_category_type == "691beef0c2cfd41cc117ef6f"  ? //video
item.share_file_dtl.file_view_path == "" ? 
<><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.share_title} loading="lazy"/>1</>
:  
<><VideoCard key={item._id} blog={{ thumbnail_view_path:item.share_thumbnail_dtl.file_view_path, title:item.share_title, content_alias:item.share_content_alias}}/></>
: item.share_category_type == "691beef0c2cfd41cc117ef6e"  ? //reel
item.share_file_dtl.file_view_path == "" ? 
<><img src={`${WEBSITE_URL}/images/image-not-found.png`}  title={item.share_title} loading="lazy"/>1</>
:  
<><VideoCard key={item._id} blog={{ thumbnail_view_path:item.share_thumbnail_dtl.file_view_path, title:item.share_title, content_alias:item.share_content_alias}}/></> 
: 
<></> 
}
</div>
                        </div>
                        <div className="user">
                            {item.share_user_file_dtl.filesize == "" ? 
                            <><img src={`${WEBSITE_URL}/images/no-profile-picture-15257.png`} loading="lazy"/></>
                                :  
                            <><img src={item.share_user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                            }
                            <div className="user-info">
                            <h5>{item.share_user_name}</h5>
                            <p className="date">{moment(item.share_created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                            </div>
                        </div>
                        <div className="sort-desc">{item.share_sort_description}</div>
                        <div className='sort-desc mt-1' dangerouslySetInnerHTML={{__html: item.share_content}} />
                        {/* <a href="" 
                            onClick={(e) => {
                            e.preventDefault();
                            BlogDetails(item);
                        }}
                        >Read More</a> */}
                        {item.like==false && item.comment==false && item.share==false ? <></> :
                <div className="fb-actions">
                    {item.like ? 
                    <button onClick={()=>LikeAndDislikeOnSharePost(item)} className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                        <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                    </button>
                    :<></>}
                    {item.comment ? 
                    <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                        <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                    </button>
                    :<></>}
                    {item.share ? 
                        <button className={item.my_shares > 0 ? 'fb-btn share active' : 'fb-btn share'} type='button' disabled={actionloader?true:false}>
                             {/* onClick={()=>ShareBlog(item)} */}
                        <label style={{ 'cursor':'pointer' }} onClick={()=>OpenShareModal(item)} ><i className="bi bi-share"></i> {item.total_shares} {item.total_shares <= 1 ? 'Share' : 'Shares'} </label>  
                        {item.total_shares >0 ? 
                        <><i className="bi bi-eye-fill" title='View' alt="View" onClick={()=>OpenShareList(item)}></i></> : <></>
                        }
                        
                    </button>
                    :<></>}
                </div>
                }
                        </section>

                </div>
                :
                <section key={index}>
                <h3 title={item.title} className='blog-title'><Truncatetext text={item.title} maxLength={110} /></h3>
                <div className='blog-image'>
                        {/* forvideos */}
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
                    <><img src={`${WEBSITE_URL}/images/no-profile-picture-15257.png`} loading="lazy"/></>
                        :  
                    <><img src={item.user_file_dtl.file_view_path} title={item.user_name}  loading="lazy"/></>
                    }
                    <div className="user-info">
                    <h5>{item.user_name}</h5>
                    <p className="date">{moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}</p>
                    </div>
                </div>
                <div className='sort-desc'>
                    {item.sort_description}
                </div>
                <div className='sort-desc mt-1' dangerouslySetInnerHTML={{__html: item.content}} />
                {/* <a href="" 
                    onClick={(e) => {
                    e.preventDefault();
                    BlogDetails(item);
                }}
                >Read More</a> */}
                {item.like==false && item.comment==false && item.share==false ? <></> :
                <div className="fb-actions">
                    {item.like ? 
                    <button onClick={()=>LikeAndDislike(item)} className={item.my_total_notsharelike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                        <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                    </button>
                    :<></>}
                    {item.comment ? 
                    <button onClick={()=>OpenComment(item)} className={item.my_total_notsharecomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                        <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                    </button>
                    :<></>}
                    {item.share ? 
                        <button className={item.my_shares > 0 ? 'fb-btn share active' : 'fb-btn share'} type='button' disabled={actionloader?true:false}>
                            {/* onClick={()=>ShareBlog(item)}  */}
                        <label style={{ 'cursor':'pointer' }} onClick={()=>OpenShareModal(item)}  ><i className="bi bi-share"></i> {item.total_shares} {item.total_shares <= 1 ? 'Share' : 'Shares'} </label>  
                        {item.total_shares >0 ? 
                        <><i className="bi bi-eye-fill" title='View' alt="View" onClick={()=>OpenShareList(item)}></i></> : <></>
                        }
                    </button>
                    :<></>}
                </div>
                }
                </section>
            }
            </div>
            )
        }    
        {listloader==true ? <><Blogloader/></> : <></>}
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
                        <Form>
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

                            {/* Buttons */}
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                variant="secondary"
                                onClick={() => closemodal()}
                                >
                                Cancel
                                </Button>
 
 {
    comment_form.is_shared_blog==true ? 
    <>
    {comment_form._id=="" ? 
                                <><Button variant="primary" type="button" onClick={()=> CommentOnSharePost()} disabled={comment_actionloader == true ? true:false}>Post Comment</Button></>
                                 : 
                                 <><Button variant="warning" type="button" onClick={()=>CommentOnSharePost()} disabled={comment_actionloader == true ? true:false}>Update Comment</Button></>
                                 }
    </>
     : 
    <>
    {comment_form._id=="" ? 
                                <><Button variant="primary" type="button" onClick={()=>Comment()} disabled={comment_actionloader == true ? true:false}>Post Comment</Button></>
                                 : 
                                 <><Button variant="warning" type="button" onClick={()=>Comment()} disabled={comment_actionloader == true ? true:false}>Update Comment</Button></>
                                 }
    </>

 }
                                
                                
                                
                            </div>
                            </Form>
                    </Modal.Body>
                    <Modal.Footer>
<div className='container'>
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
              {moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}
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
                    </Modal.Footer>
                </Modal>



<Modal 
                show={showshare_modal} 
                onHide={() => closesharemodal()}
                backdrop="static"  
                keyboard={false}  
                    >
                    <Modal.Header closeButton>
                    <Modal.Title>Share({share_total_rec})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                       <div className='container'>
 <div className="comments-section" onScroll={handleshareScroll}>
  {share_listloader && (
    <h4 className="text-center">Loading..</h4>
  )}

  {share_datalist.map((item, index) => (
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
          </div>
          <p className="comment-text">
           Share on {moment(item.created_at).format("DD-MMM-YYYY, hh:mm A")}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

<div className='spinner-div'>
{
    share_listloader == true ? 
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
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>


<Modal 
                show={showshare_postmodal} 
                onHide={() => closesharepostmodal()}
                backdrop="static"  
                keyboard={false}  
                    >
                    <Modal.Header closeButton>
                    <Modal.Title>Share Post</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

<div className='container '>
    <div className='col-md-12 share-to-public-div'>
        <button className='btn btn-warning share-to-public' disabled={loding_share_topublic==true?true:false} type='bytton' onClick={() => ShareToPublic()}><i className="bi bi-send"></i> Share to Public</button>
    </div>
     <div className='col-md-12 mt-2'>
        <h6 className='text-decoration-underline'>OR</h6>
    </div>
</div>

                       <div className='container'>


  
  <div className='row'>
    <div className='col-md-6'>
        <h6 className='text-decoration-underline text-primary sdsd'>Share to friends only</h6>    
    </div>
    <div className='col-md-6'>
        {selectedusers.current.size > 0 ?
        <><button className='btn btn-primary share-to-friend-share' disabled={loding_share_topublic==true?true:false} onClick={()=>ShareToFriends()} type='bytton'><i className="bi bi-send"></i> Share to {selectedusers.current.size}</button></> 
        : <></>
        }
        
    </div>
</div>               
 <div className="comments-section" onScroll={handlesharePostScroll}>
  {sharepost_friendlistloader && (
    <h4 className="text-center">Loading..</h4>
  )}

  {sharepost_friendlist.map((item, index) => (
    <div className={item.is_selected ? 'comment share-users selected-shared-user' : 'comment share-users'} key={index} onClick={()=>selectthisuser(item)}>
      <img
        className="avatar"
        src={
          item.user_file_dtl.file_view_path
            ? item.user_file_dtl.file_view_path
            : `${WEBSITE_URL}/images/image-not-found.png`
        }
        title={item.user_name}
        loading="lazy"
      />

      <div className="comment-body">
        <div className="comment-box share-comment-box">
          
          <div className="comment-header">
            <span className="username">Share to {item.name}</span>
            
            <label className="check-container">
            <input type="checkbox" checked={item.is_selected ? true : false} onChange={()=>selectthisuser(item)}/>
            <span className="checkmark"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

<div className='spinner-div'>
{
    sharepost_friendlistloader == true ? 
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
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>

            </div>
            <div className="col-md-3 text-center">
                <Userslist/>
            </div>
            </div>
        </div>
        </>
    )
}

export default Blogdetails;