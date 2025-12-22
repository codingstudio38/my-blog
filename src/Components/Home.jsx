import './../Css/Home.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext,decrypt,encrypt,WEBSITE_URL } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
import Allnotifications from './Allnotifications.jsx';
import VideoCard from './VideoCard.jsx';
import { Modal, Button,Form } from 'react-bootstrap';
 
function Home(){
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
    async function Allblogs() {
        try {
            if (listloader) {
                return false;
            }
            setlistloader(true);
            setTimeout(async ()=>{
                let url = `${API_URL}/all-blogs?page=${currentpage}&limit=${limit}`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',is_archive:0});
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
            shared_blog_id:item.shared_blog_id,
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
    
    
async function ShareBlog(item) {
        try {
            if (actionloader) {
                return false;
            }
            setactionloader(true);
             setTimeout(async ()=>{
            let url = `${API_URL}/share-blog`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:item._id});
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
                        swal({
                            title: `Success`,
                            icon: "success",
                        });
                        let newdatalist = datalist.map(row => {
                        if (row._id === item._id) {
                            return {
                                ...row,
                                total_shares:data.total_shares,
                                my_shares: data.my_shares
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
                },500)
        } catch (error) {
            setactionloader(false);
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
                        <div className="sort-desc"><Truncatetext text={item.share_sort_description} maxLength={200} /></div>
                        <a href="" 
                            onClick={(e) => {
                            e.preventDefault();
                            BlogDetails(item);
                        }}
                        >Read More</a>
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
                        <button onClick={()=>ShareBlog(item)} className={item.my_shares > 0 ? 'fb-btn share active' : 'fb-btn share'} type='button' disabled={actionloader?true:false}>
                        <i className="bi bi-share"></i> {item.total_shares} {item.total_shares <= 1 ? 'Share' : 'Shares'} 
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
                    <Truncatetext text={item.sort_description} maxLength={200} />
                </div>
                <a href="" 
                    onClick={(e) => {
                    e.preventDefault();
                    BlogDetails(item);
                }}
                >Read More</a>
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
                        <button onClick={()=>ShareBlog(item)} className={item.my_shares > 0 ? 'fb-btn share active' : 'fb-btn share'} type='button' disabled={actionloader?true:false}>
                        <i className="bi bi-share"></i> {item.total_shares} {item.total_shares <= 1 ? 'Share' : 'Shares'} 
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
                                <><Button variant="primary" type="button" onClick={()=> CommentOnSharePost()} disabled={comment_actionloader == true ? true:false}>Post Comment1</Button></>
                                 : 
                                 <><Button variant="warning" type="button" onClick={()=>CommentOnSharePost()} disabled={comment_actionloader == true ? true:false}>Update Comment1</Button></>
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

export default Home;