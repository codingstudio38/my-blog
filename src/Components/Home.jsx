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
import Table from 'react-bootstrap/Table';
import { Pagination } from 'antd';
function Home(){
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [actionloader, setactionloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(5);
    const [total_rec, settotal_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
    const [current_scroll_position, setCurrent_scroll_position] = useState(0);
    const [pre_scroll_position, setPre_scroll_position] = useState(0);
    const [showcomment_modal, setshowcomment_modal] = useState(false);
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
                            // let mylike = row.mylike;
                            // let total_likes = row.total_likes;
                            // if(status==1){
                            //     mylike=mylike+1;
                            //     total_likes=total_likes+1;
                            // } else {
                            //     mylike=mylike-1;
                            //     total_likes=total_likes-1;
                            // }
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
    const [user_comment_details, setuser_comment_details] = useState({
        user_id:'',
        blog_id:'',
        comment:'',
        _id:'',
    });
    const [comment_form, setcomment_form] = useState({
        comment:'',
        delete:'',
    });
    async function OpenComment(item) {
        try {
            setactionloader(true);
           let url = `${API_URL}/user-blog-comment`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:item._id});
                let headers = {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${LOGIN_USER.token}`,
                };
                let response = await Post_With_Htoken(myform, url, headers);
                setactionloader(false);
                if(response!==""){
                    comment_blog_details.current = item;
                    //  setcomment_blog_details((pre)=>{
                    //         return item;
                    //     });
                    CommentList();
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                         const b =  data.result==null?{
                                    user_id:'',
                                    blog_id:'',
                                    comment:'',
                                    _id:'',
                                }:data.result;
                        setuser_comment_details((pre)=>{
                            return b;
                        });
                        setcomment_form(pre => ({
                            ...pre,
                            comment: b.comment
                        }))
                        setshowcomment_modal(true);
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
    function deleteComment(){
        let d = comment_form;
        d['delete']=1;
        setcomment_form(pre =>{ 
            return { ...pre, delete: 1 }
        });
        Comment();
    }
    async function Comment() {
        try {
            let status = user_comment_details._id=="" ? 1 : 2;
            if(comment_form.delete==1){
                status=0;
            }
            setactionloader(true);
           let url = `${API_URL}/blog-comment`;
                let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:comment_blog_details.current._id,status:status,comment:comment_form.comment,comment_id:user_comment_details._id});
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
                        if (row._id === comment_blog_details.current._id) {
                            // let mylike = row.mylike;
                            // let total_likes = row.total_likes;
                            // if(status==1){
                            //     mylike=mylike+1;
                            //     total_likes=total_likes+1;
                            // } else {
                            //     mylike=mylike-1;
                            //     total_likes=total_likes-1;
                            // }
                            return {
                                ...row,
                                mycomment:status,
                                total_comments: data.total
                            };
                        }
                        return row;
                    });
                    setDatelist((prev) => {return newdatalist});
                    setshowcomment_modal(false);
                    setcomment_form({
                        comment:'',
                        delete:'',
                    })
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
    function changePage(page){
        setcurrentpage(page)
    }
    function BlogDetails(row){
         navigate(`/web/blog-details/${row.content_alias}`);
         return true;
    }
    const [comment_listloader, setcomment_listloader] = useState(false);
    const [comment_datalist, setcomment_datalist] = useState([]);
    const [comment_limit, setcomment_limit] = useState(5);
    const [comment_total_rec, setcomment_total_rec] = useState(0);
    let [comment_currentpage, setcomment_currentpage] = useState(1);
    const [comment_lastpage, setcomment_lastpage] = useState(1);
  
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
            //  setTimeout(async ()=>{},1000)
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
                        setcomment_datalist((prev) => [...prev, ...data.result.docs]);
                        // setDatelist((dataid) => { return data.result.list });
                        setcomment_total_rec((dataid) => { return data.result.total });
                        setcomment_lastpage((dataid) => { return data.result.totalpage });
                    } else {
                        swal({
                            title: `${data?.message}`,
                            icon: "warning",
                        })
                    }
                }
                
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
                        <div className="fb-actions">
                        <button onClick={()=>LikeAndDislike(item)} className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
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
            )
        }    
        {listloader==true ? <><Blogloader/></> : <></>}
                <Modal show={showcomment_modal} onHide={() => closemodal()}>
                    <Modal.Header closeButton>
                    <Modal.Title>Comments({comment_total_rec})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={(e)=>{
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

                            {/* Buttons */}
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                variant="secondary"
                                onClick={() => closemodal()}
                                >
                                Cancel
                                </Button>

                                {
                                user_comment_details._id!="" ?
                                <Button variant='danger' type="button"
                                disabled={actionloader == true ? true:false}
                                    onClick={() => deleteComment()}
                                >
                                Delete
                                </Button>
                                :
                                <></>
                                }
                                <Button variant="primary" type="submit" disabled={actionloader == true ? true:false}>
                                {user_comment_details._id=="" ? <>Post Comment</> : <>Update Comment</>}
                                </Button>
                            </div>
                            </Form>
                    </Modal.Body>
                    <Modal.Footer>

                        <div className="comments-section">
                          <h4 className='text-center'>{comment_listloader==true ?<>Loading..</>:<></>}</h4>  
 {comment_datalist.map((item, index) =>
  <div className="comment" key={index}>
    {item.user_file_view_path == "" ? 
        <><img className="avatar" src={`${WEBSITE_URL}/images/image-not-found.png`} title={item.user_name} loading="lazy"/></>
            :  
        <><img className="avatar" src={item.user_file_view_path} title={item.user_name} loading="lazy"/></>
    }
    <div className="comment-body">
      <div className="comment-box">
        <span className="username">{item.user_name}</span>
        <p className="comment-text">
          {item.comment}
          <br/>
         <small>{item.updated_at==null?item.created_at:item.updated_at}</small>
        </p>
      </div>

      {/* <div className="comment-actions">
        <a href="#">Like</a>
        <a href="#">Reply</a>
        <span>· 2h</span>
      </div>
 
      <div className="reply">
        <img src="https://i.pravatar.cc/32?img=2" className="avatar small" alt="user"/>
        <div>
          <div className="comment-box">
            <span className="username">Admin</span>
            <p className="comment-text">
              Glad you liked it 😊
            </p>
          </div>
          <div className="comment-actions">
            <a href="#">Like</a>
            <a href="#">Reply</a>
            <span>· 1h</span>
          </div>
        </div>
      </div> */}

    </div>
     
  </div>
 )
}
</div>
        {comment_currentpage < comment_lastpage ? 
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
        }
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