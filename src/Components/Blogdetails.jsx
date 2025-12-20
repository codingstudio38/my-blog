import './../Css/Home.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext,WEBSITE_URL } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
import Allnotifications from './Allnotifications.jsx';
import { useParams } from "react-router-dom";
import VideoCard from './VideoCard.jsx';
import { Modal, Button,Form } from 'react-bootstrap';
 
function Blogdetails(){
    const { id } = useParams();
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const firstCall = useRef(true);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    useEffect(() => {
            document.title = "MERN Technology || Blog Details";
            if (LOGIN_USER === false) {
                navigate('/');
                return;
            }
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            // console.log(id);
            Allblogs();
        }, []);

     
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
     
    async function LikeAndDislike(item) {
        try {
            let status = item.mylike <= 0 ? 1 : 0;
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
        blog_post_by:'',
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
                blog_post_by:item.user_id,
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
                let myform = JSON.stringify({user_id:comment_form.user_id,blog_id:comment_form.blog_id,status:status,comment:comment_form.comment,comment_id:comment_form._id,blog_post_by:comment_form.user_id});
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
                            {item.sort_description}
                        </div>
                        {/* <a href="">Read More</a> */}
                        {item.like==false && item.comment==false && item.share==false ? <></> :
                        <div className="fb-actions">
                            {item.like ? 
                            <button onClick={()=>LikeAndDislike(item)} className={item.mylike > 0 ? 'fb-btn like active' : 'fb-btn like'} type='button' disabled={actionloader?true:false} >
                                <i className="bi bi-hand-thumbs-up"></i> {item.total_likes} {item.total_likes <= 1 ? 'Like' : 'Likes'} 
                            </button>
                            :<></>}
                        {item.comment ? 
                            <button onClick={()=>OpenComment(item)} className={item.mycomment > 0 ? 'fb-btn comment active' : 'fb-btn comment'} type='button' disabled={actionloader?true:false}>
                                <i className="bi bi-chat"></i> {item.total_comments} {item.total_comments <= 1 ? 'Comment' : 'Comments'} 
                            </button>
                            :<></>}
                        
                        {item.share ? 
                            <button className="fb-btn share " type='button' disabled={actionloader?true:false}>
                                <i className="bi bi-share"></i> Share
                            </button>
                            :<></>}
                        
                        </div>
                        }
                        </section>
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
 
                                
                                {comment_form._id=="" ? 
                                <><Button variant="primary" type="submit" disabled={comment_actionloader == true ? true:false}>Post Comment</Button></>
                                 : 
                                 <><Button variant="warning" type="submit" disabled={comment_actionloader == true ? true:false}>Update Comment</Button></>
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

export default Blogdetails;