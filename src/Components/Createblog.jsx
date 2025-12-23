import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext } from './Constant.jsx';
import Ckeditor from './Ckeditor.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
// import Header from './Header.jsx';
import { Pagination } from 'antd';
import Table from 'react-bootstrap/Table';
import { Modal, Button ,Form} from "react-bootstrap";

export default function Createblog() {
    const [currentpage, setcurrentpage] = useState(1);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const childRef = useRef(true);
    const childRef2 = useRef(true);
    const firstCall = useRef(true);
    const [loader, setLoader] = useState(false);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(5);
    const [total_rec, settotal_rec] = useState(0);

    const [Archivecurrentpage, setArchivecurrentpage] = useState(1);
    const [Archivelistloader, setArchivelistloader] = useState(false);
    const [dataArchivelist, setArchiveDatalist] = useState([]);
    const [Archivelimit, setArchivelimit] = useState(5);
    const [total_Archive_rec, setArchivetotal_rec] = useState(0);

    const [file_type, setfile_type] = useState('image/*');

    const [blog_details, setBdetails] = useState({
        "id":"",
        "edit":false,
        "user_id":LOGIN_USER._id,
        "title": "",
        "content": "",
        "photo": "",
        "sort_description": "",
        "blog_type": "",
        "file_view_path": "",
        "thumbnail_file_view_path": "",
        "thumbnail": "",
        "edit_photo":"",
        "edit_thumbnail":"",
        "like":true,
        "share":true,
        "comment":true,
    });

    useEffect(() => {
        document.title = "MERN Technology || User - Create Blog";
        // document.body.style.backgroundColor = "aliceblue";
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
        if (firstCall.current) {
            firstCall.current = false;
            return;
        }
        BlogCetegoryList();
        Myblogs();
    }, [currentpage]);

    useEffect(() => {
        if (childRef2.current) {
            childRef2.current = false;
            return;
        }
        MyArchiveblogs();
    }, [Archivecurrentpage]);

    
    async function Myblogs() {
        try {
            setlistloader(true);
            let url = `${API_URL}/my-blogs?page=${currentpage}&limit=${limit}`;
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
                    setDatelist((dataid) => { return data.result.list });
                    settotal_rec((dataid) => { return data.result.total });
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
    async function MyArchiveblogs() {
        try {
            setlistloader(true);
            let url = `${API_URL}/my-blogs?page=${Archivecurrentpage}&limit=${Archivelimit}`;
            let myform = JSON.stringify({user_id:LOGIN_USER._id,title:'',is_archive:1});
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
                    setArchiveDatalist((dataid) => { return data.result.list });
                    setArchivetotal_rec((dataid) => { return data.result.total });
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
    async function CreateBlog() {
        try {
            setLoader(true);
            let url = `${API_URL}/create-blog`;
            let myform = JSON.stringify(blog_details);
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
             setLoader(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                setDatelist([]);
                settotal_rec(0);
                setcurrentpage(1);
                setlimit(5);
                Myblogs();
                setBdetails((data) => {
                    return {
                        "edit":false,
                        "id":"",
                        "user_id":LOGIN_USER._id,
                        "title": "",
                        "content": "",
                        "photo": "",
                        "file_view_path": "",
                        "sort_description": "",
                        "blog_type": "",
                        "thumbnail_file_view_path": "",
                        "thumbnail": "",
                        "edit_photo":"",
                        "edit_thumbnail":"",
                        "like":true,
                        "share":true,
                        "comment":true,
                    }
                })
                swal({
                    title: `Success`,
                    icon: "success",
                })
                if (childRef.current) {
                    childRef.current.Resetckeditor('editor')
                }
            } else {
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
        }
        } catch (error) {
            setLoader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    async function UploadPhoto(event) {
        try {
            setLoader(true);
            let url = `${API_URL}/upload-blog-images`;
            let myform = new FormData();
            myform.append("photo", event.target.files[0]);
            myform.append("userid", LOGIN_USER._id);
            let headers = {
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
            setLoader(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                setBdetails((data) => {
                    return { ...data, "photo": response.file_name, "file_view_path": response.result }
                })
                swal({
                    title: `Successfully uploaded`,
                    icon: "success",
                })
                event.target.value="";
            } else {
                setBdetails((data) => { return { ...data, "photo": "", "file_view_path": "" } })
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
        }
        } catch (error) {
            setLoader(false);
            setBdetails((data) => { return { ...data, "photo": "", "file_view_path": "" } })
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
   
    const [thumbnail_loader, setthumbnail_loader] = useState(false);
    async function UploadThumbnail(event) {
        try {
            setthumbnail_loader(true);
            let url = `${API_URL}/upload-blog-thumbnail`;
            let myform = new FormData();
            myform.append("photo", event.target.files[0]);
            myform.append("userid", LOGIN_USER._id);
            let headers = {
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
            setthumbnail_loader(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                setBdetails((data) => {
                    return { ...data, "thumbnail": response.file_name, "thumbnail_file_view_path": response.result }
                })
                swal({
                    title: `Successfully uploaded`,
                    icon: "success",
                })
                event.target.value="";
            } else {
                setBdetails((data) => { return { ...data, "thumbnail": "", "thumbnail_file_view_path": "" } })
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
        }
        } catch (error) {
            setthumbnail_loader(false);
            setBdetails((data) => { return { ...data, "thumbnail": "", "thumbnail_file_view_path": "" } })
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    // async function DeleteRow(row) {
    //     try {
    //         swal({
    //             title: "Are you sure?",
    //             text: "Are you sure that you want to delete the recode?",
    //             icon: "warning",
    //             buttons: ["Cancel", "Yes"],
    //             dangerMode: true,
    //         }).then(async (d) => {
    //             if (d) {
    //                 let url = `${API_URL}/delete-blogs/${row._id}`;
    //                 let myform = JSON.stringify({user_id:LOGIN_USER._id,id:row._id});
    //                 let headers = {
    //                     'Content-Type': 'application/json',
    //                     'authorization': `Bearer ${LOGIN_USER.token}`,
    //                 };
    //                 let response = await Post_With_Htoken(myform, url, headers);
    //                 if(response!==""){
    //                 response = await response.json();
    //                 const data = response;
    //                 if (data.status == 200) {
    //                     setDatelist([]);
    //                     settotal_rec(0);
    //                     setcurrentpage(1);
    //                     setlimit(5);
    //                     Myblogs();
    //                     swal({
    //                         title: `Successfully deleted`,
    //                         icon: "success",
    //                     })
    //                 } else {
    //                     swal({
    //                         title: `${data?.message}`,
    //                         icon: "warning",
    //                     })
    //                 }
    //             }
    //             }
    //         })
    //         } catch (error) {
    //         swal({
    //             title: `Unknow error:- ${error.message}`,
    //             icon: "error",
    //         })
    //     }
    // }

    async function UpdateBlogArchive(row,status) {
        try {
            swal({
                title: "Are you sure?",
                // text: "Are you sure that you want to delete the recode?",
                icon: "warning",
                buttons: ["Cancel", "Yes"],
                dangerMode: true,
            }).then(async (d) => {
                if (d) {
                    let url = `${API_URL}/update-blog-archive`;
                    let myform = JSON.stringify({user_id:LOGIN_USER._id,blog_id:row._id,status:status});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    let response = await Post_With_Htoken(myform, url, headers);
                    if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        // if(status){
                        //     setDatelist([]);
                        //     settotal_rec(0);
                        //     setcurrentpage(1);
                        //     setlimit(5);
                        //     Myblogs();
                        // } else {
                        //     setArchiveDatalist([]);
                        //     setArchivetotal_rec(0);
                        //     setArchivecurrentpage(1);
                        //     setArchivelimit(5);
                        //     MyArchiveblogs();
                        // }
                        setDatelist([]);
                        settotal_rec(0);
                        setcurrentpage(1);
                        setlimit(5);
                        Myblogs();
                        
                        setArchiveDatalist([]);
                        setArchivetotal_rec(0);
                        setArchivecurrentpage(1);
                        setArchivelimit(5);
                        MyArchiveblogs();
                        swal({
                            title: `Successfully moved to archive.`,
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
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    const [editdata,seteditdata] = useState(null)
    let blogtypeRef = useRef(false)
    async function EditRow(row,blogtype) {
        try {
                blogtypeRef.current = blogtype;
                let url = `${API_URL}/blog-byid/${row._id}`;
                let myform = JSON.stringify({id:row._id});
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
                   if(data.result.total > 0){
                    seteditdata(blog);
                    setBdetails((data)=>{
                        return {
                            "sort_description":blog.sort_description,
                            "blog_type":blog.blog_type,
                            "edit":true,
                            "id":blog._id,
                            "user_id":blog.user_id,
                            "title": blog.title,
                            "content": blog.content,
                            "photo":"",
                            "file_view_path": blog.photo!==null ? blog.file_dtl.file_view_path :"",
                            "thumbnail_file_view_path": blog.thumbnail!==null ? blog.thumbnail_dtl.file_view_path :"",
                            "thumbnail": "",
                            "edit_photo":blog.photo,
                            "edit_thumbnail":blog.thumbnail,
                            "like":blog.like,
                            "share":blog.share,
                            "comment":blog.comment,
                        }
                    })
                    if(blog.blog_type=='691beef0c2cfd41cc117ef70'){
                        setfile_type('image/*');
                    } else {
                        setfile_type('video/*,.mkv');
                    }
                    if (childRef.current) {
                        childRef.current.setckeditor('editor',blog.content);
                    }
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
    async function UpdateBlog() {
        try {
            setLoader(true);
            let url = `${API_URL}/update-blog`;
            let myform = JSON.stringify(blog_details);
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
            setLoader(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                // setDatelist([]);
                // settotal_rec(0);
                // // setcurrentpage(1);
                // setlimit(5);
                // Myblogs();

                if(!blogtypeRef.current){
                    setDatelist([]);
                    settotal_rec(0);
                    // setcurrentpage(1);
                    setlimit(5);
                    Myblogs();
                } else {
                    setArchiveDatalist([]);
                    setArchivetotal_rec(0);
                    // setArchivecurrentpage(1);
                    setArchivelimit(5);
                    MyArchiveblogs();
                }
                setBdetails((data) => {
                    return {
                        "edit":false,
                        "id":"",
                        "user_id": LOGIN_USER._id,
                        "title": "",
                        "content": "",
                        "photo": "",
                        "file_view_path": "",
                        "sort_description":"",
                        "blog_type":"",
                        "thumbnail_file_view_path":"",
                        "thumbnail":"",
                        "edit_photo":"",
                        "edit_thumbnail":"",
                        "like":true,
                        "share":true,
                        "comment":true,
                    }
                })
                swal({
                    title: `Success`,
                    icon: "success",
                })
                if (childRef.current) {
                    childRef.current.Resetckeditor('editor')
                }
            } else {
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
            }
        } catch (error) {
            setLoader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    function changePage(page){
        setcurrentpage(page)
    }

  const getEditorData = (data) => {
    setBdetails(prev => ({ ...prev, content: data }))
  };

  const [category,setCategory] = useState([]);//
async function BlogCetegoryList() {
        try {
            setLoader(true);
            let url = `${API_URL}/blog-cetegory-list`;
            let myform = JSON.stringify({name:''});
            let headers = {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
            let response = await Post_With_Htoken(myform, url, headers);
            setLoader(false);
            if(response!==""){
            response = await response.json();
            const data = response;
            if (data.status == 200) {
                setCategory(data.result.list);
            } else {
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
            }
        } catch (error) {
            setLoader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

    function chenge_blog_type(e){
 setBdetails({ ...blog_details, blog_type: e}); 
        if(e=='691beef0c2cfd41cc117ef70'){
            setfile_type('image/*');
        } else {
            setfile_type('video/*,.mkv');
        }

    }
     const [settingmodal, setsettingmodal] = useState(false);
    const [shared_blog_details, setshared_blog_details] = useState({
        "id":"",
        "like":true,
        "share":true,
        "comment":true,
        "blogtype":false
    });
    async function Settings(row,blogtype) {
        setshared_blog_details((pre)=>{
            return {...pre,id:row._id,like:row.like,share:row.share,comment:row.comment,blogtype:blogtype}
        });
        setsettingmodal(true);
    }
    function closesettingmodal(){
        setsettingmodal(false);
    }
    async function UpdateBlogSetting() {
        try {
            // console.log(shared_blog_details);
             let url = `${API_URL}/update-blog-settings`;
                    let myform = JSON.stringify(shared_blog_details);
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    let response = await Post_With_Htoken(myform, url, headers);
                    if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                         setsettingmodal(false);
                        if(shared_blog_details.blogtype==false){
                            setDatelist([]);
                            settotal_rec(0);
                            setcurrentpage(1);
                            setlimit(5);
                            Myblogs();
                        } else {
                            setArchiveDatalist([]);
                            setArchivetotal_rec(0);
                            setArchivecurrentpage(1);
                            setArchivelimit(5);
                            MyArchiveblogs();
                        }
                        swal({
                            title: `Successfully updated.`,
                            icon: "success",
                        })
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
    return (
        <>
           
            <section>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-9">
                            <h1 className="mb-4 text-dark text-decoration-underline">Create Blog</h1>
                            <div className="card" style={{ borderRadius: '15px' }}>
                                <div className="card-body">
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Blog Type</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                        <select value={blog_details.blog_type} id='blog_type' name='blog_type' onChange={(e) =>{chenge_blog_type(e.target.value)}} className="form-select form-select-lg">
                                            <option value="">Type</option>
                                            {category.map((city,key) => (
                                            <option key={key} value={city._id}>
                                                {city.name}
                                            </option>
                                            ))}
                                        </select>
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Title</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='title' value={blog_details.title} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, title: e.target.value })} />
                                        </div>
                                    </div>
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center py-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Sort Description</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <textarea className="form-control form-control-lg" id="sort_description" value={blog_details.sort_description} rows="3" onChange={(e) => setBdetails({ ...blog_details, sort_description: e.target.value })}></textarea>
                                        </div>
                                    </div>
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center py-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Description</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                                <Ckeditor getcontent={getEditorData} ckid={"editor"} ref={childRef}/>
                                        </div>
                                    </div>
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center py-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Upload File</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <div className='row'>
                                                <div className="col-md-8">
                                                    <input className="form-control form-control-lg" id="photo" type="file" accept={file_type} onChange={(e) => UploadPhoto(e)} disabled={loader == true ? "disabled" : null} />
                                                    <div className="small text-muted mt-2">Allow only images. Max file size 2 MB</div>
                                                </div>
                                                <div className="col-md-4">
                                                    {
                                                        blog_details.edit == true ? 
                                                        <>
                                                            {blog_details.edit_photo !== "" && blog_details.blog_type=='691beef0c2cfd41cc117ef70'
                                                                ?
                                                                <>
                                                                    <img src={blog_details.file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                                </>
                                                                :
                                                                <></>
                                                            }
                                                        </> 
                                                        : 
                                                        <>
                                                            {blog_details.photo !== "" && blog_details.blog_type=='691beef0c2cfd41cc117ef70'
                                                                ?
                                                                <>
                                                                    <img src={blog_details.file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                                </>
                                                                :
                                                                <></>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                                
                                            </div>

                                        </div>
                                    </div>
                                    {blog_details.blog_type!=='691beef0c2cfd41cc117ef70' && blog_details.blog_type!==''?
                                    <>
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center py-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Upload Thumbnail</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <div className='row'>
                                                <div className="col-md-8">
                                                    <input className="form-control form-control-lg" id="thumbnail" type="file" accept="image/*" onChange={(e) => UploadThumbnail(e)} disabled={thumbnail_loader == true ? "disabled" : null} />
                                                    <div className="small text-muted mt-2">Allow only images. Max file size 2 MB</div>
                                                </div>
                                                <div className="col-md-4">
                                                    {
                                                        blog_details.edit == true ? 
                                                        <>
                                                            {blog_details.edit_thumbnail !== ""
                                                                ?
                                                                <>
                                                                    <img src={blog_details.thumbnail_file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                                </>
                                                                :
                                                                <></>
                                                            }
                                                        </> 
                                                        : 
                                                        <>
                                                            {blog_details.thumbnail !== ""
                                                                ?
                                                                <>
                                                                    <img src={blog_details.thumbnail_file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                                </>
                                                                :
                                                                <></>
                                                            }
                                                        </>
                                                    }
                                                   
                                                </div>
                                                
                                            </div>

                                        </div>
                                    </div>
                                    </>:<></>

                                    }
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Public Action</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <div className='row'>
                                                <div className='col-md-4'>
                                                    <label htmlFor="Like">Like</label>
                                                    <select value={blog_details.like} id='Like' name='Like' onChange={(e) => setBdetails({ ...blog_details, like: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                                        <option value="true">Enable</option>
                                                        <option value="false">Disable</option>
                                                    </select>
                                                </div>
                                                <div className='col-md-4'>
                                                    <label htmlFor="Comment">Comment</label>
                                                    <select value={blog_details.comment} id='Comment' name='Comment' onChange={(e) => setBdetails({ ...blog_details, comment: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                                        <option value="true">Enable</option>
                                                        <option value="false">Disable</option>
                                                    </select>
                                                </div>
                                                <div className='col-md-4'>
                                                    <label htmlFor="Share">Share</label>
                                                    <select value={blog_details.share} id='Share' name='Share' onChange={(e) => setBdetails({ ...blog_details, share: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                                        <option value="true">Enable</option>
                                                        <option value="false">Disable</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="mx-n3" />
                                    <div className="px-5 py-4">

                                        {blog_details.edit ? 
                                        <>
                                        <button type="button" onClick={()=>{UpdateBlog()}} data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg"
                                            disabled={loader == true ? "disabled" : null} >
                                            {loader ?
                                                "Loding.."
                                                :
                                                "Update"
                                            }
                                        </button>
                                        </> 
                                        : 
                                        <>
                                        <button type="button" onClick={()=>{CreateBlog()}} data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg"
                                            disabled={loader == true ? "disabled" : null} >
                                            {loader ?
                                                "Loding.."
                                                :
                                                "Submit"
                                            }
                                        </button>
                                        </>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className='container'>
                 <br></br>
                <h2 style={{ textAlign: "center" }}>My Blogs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th className='th-center'>#</th>
                        <th className='th-center'>User Name</th>
                        <th className='th-center'>Blog Type</th>
                        <th className='th-center'>Title</th>
                        <th className='th-center'>Sort Description</th>
                        <th className='th-center'>Content</th>
                        <th className='th-center'>Blog Photo</th>
                        <th className='th-center'>Thumbnail</th>
                        <th className='th-center'>Created Date</th>
                        <th className='th-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {listloader==true ? 
                    <tr>
                        <td className='td-center' colSpan={10}>Loading..</td>
                    </tr>
                    :
                        datalist.map((item, index) =>
                            <tr key={index} id={index} data-attributes={index}>
                                <td align='center'>{
                                currentpage==1 ?
                                index + 1
                                 :
                                (limit*(currentpage-1)) + (index+1)
                                }
                                </td>
                                <td align='center'>{item.user_name} </td>
                                <td align='center'>{item.category_type_name} </td>
                                <td align='center'><Truncatetext text={item.title} maxLength={20}/></td>
                                <td align='center'>
                                    {item.sort_description!==null || item.sort_description!=="" ? <>
                                    <Truncatetext text={item.sort_description} maxLength={20}/>
                                    </> : <>Not Available</>}
                                </td>
                                <td align='center'>
                                    {item.content!==null || item.content!=="" ? <>
                                    Available
                                    {/* <div dangerouslySetInnerHTML={{ __html: item.content }} /> */}
                                    </> : <>Not Available</>}
                                </td>
                                <td align='center'>
{item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.file_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/music.png' style={{ "height": "40px", "width": "40px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/video-marketing.png' style={{ "height": "40px", "width": "40px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/film-reel.png' style={{ "height": "40px", "width": "40px" }} /></> 
: 
<></> 
}
                                </td>

<td align='center'>
{item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
    <></>
: item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></> 
: 
<></>  
}
                                </td>


                                <td align='center'>{item.created_at} / {item.updated_at}</td>
                                <td align='center'>
                                    {item.is_shared_blog==false ? 
                                    <>
                                    <button type='button' className='btn btn-warning btn-sm' onClick={() => EditRow(item,false)}>
                                        Edit
                                    </button><br/>
                                    </>
                                    :
                                    <>
                                    <small>Shared Post</small><br/>
                                    <button type='button' title='Settings' className='btn btn-info btn-sm mb-1' onClick={() => Settings(item,false)}>
                                        <i className="bi bi-gear"></i>
                                    </button><br/>
                                    </>
                                    }
                                    
                                    <button type='button' className='btn btn-danger btn-sm' onClick={() => UpdateBlogArchive(item,true)}>
                                        Move to Archive
                                    </button>
                                    {/* <button type='button' className='btn btn-danger btn-sm' style={{ marginLeft: '4px' }} onClick={() => DeleteRow(item)}>
                                       Delete
                                    </button> */}
                                </td>
                            </tr>
                        )
                    
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={10} align='center'>
                            <Pagination pageSize={limit} total={total_rec} current={currentpage} onChange={(value) => changePage(value)} showQuickJumper />
                        </td>
                    </tr>
                </tfoot>
            </Table>
            </div>

             <div className='container'>
                 <br></br>
                <h2 style={{ textAlign: "center" }}>My Archive Blogs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th className='th-center'>#</th>
                        <th className='th-center'>User Name</th>
                        <th className='th-center'>Blog Type</th>
                        <th className='th-center'>Title</th>
                        <th className='th-center'>Sort Description</th>
                        <th className='th-center'>Content</th>
                        <th className='th-center'>Blog Photo</th>
                        <th className='th-center'>Thumbnail</th>
                        <th className='th-center'>Created Date</th>
                        <th className='th-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Archivelistloader==true ? 
                    <tr>
                        <td className='td-center' colSpan={10}>Loading..</td>
                    </tr>
                    :
                        dataArchivelist.map((item, index) =>
                            <tr key={index} id={index} data-attributes={index}>
                                <td align='center'>{
                                Archivecurrentpage==1 ?
                                index + 1
                                 :
                                (Archivelimit*(Archivecurrentpage-1)) + (index+1)
                                }
                                </td>
                                <td align='center'>{item.user_name} </td>
                                <td align='center'>{item.category_type_name} </td>
                                <td align='center'><Truncatetext text={item.title} maxLength={20}/></td>
                                <td align='center'>
                                    {item.sort_description!==null || item.sort_description!=="" ? <>
                                    <Truncatetext text={item.sort_description} maxLength={20}/>
                                    </> : <>Not Available</>}
                                </td>
                                <td align='center'>
                                    {item.content!==null || item.content!=="" ? <>
                                    Available
                                    {/* <div dangerouslySetInnerHTML={{ __html: item.content }} /> */}
                                    </> : <>Not Available</>}
                                </td>
                                <td align='center'>
{item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.file_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/music.png' style={{ "height": "40px", "width": "40px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/video-marketing.png' style={{ "height": "40px", "width": "40px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
    item.file_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src='/images/film-reel.png' style={{ "height": "40px", "width": "40px" }} /></> 
: 
<></> 
}
                                </td>

<td align='center'>
{item.blog_type == "691beef0c2cfd41cc117ef70" ? //photo
    <></>
: item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></>
: item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
    item.thumbnail_dtl.filesize == "" ? 
    <span className='text-danger'>Not Available</span>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} /></> 
: 
<></>  
}
                                </td>


                                <td align='center'>{item.created_at} / {item.updated_at}</td>
                                <td align='center'>
                                    
                                    {item.is_shared_blog==false ? 
                                    <>
                                    <button type='button' className='btn btn-warning btn-sm' onClick={() => EditRow(item,false)}>
                                        Edit
                                    </button><br/>
                                    </>
                                    :
                                    <><b>Shared Post</b></>
                                    }
                                    <button type='button' className='btn btn-danger btn-sm' onClick={() => UpdateBlogArchive(item,false)}>
                                        Remove From Archive
                                    </button>
                                    {/* <button type='button' className='btn btn-danger btn-sm' style={{ marginLeft: '4px' }} onClick={() => DeleteRow(item)}>
                                       Delete
                                    </button> */}
                                </td>
                            </tr>
                        )
                    
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={10} align='center'>
                            <Pagination pageSize={Archivelimit} total={total_Archive_rec} current={Archivecurrentpage} onChange={(value) => setArchivecurrentpage(value)} showQuickJumper />
                        </td>
                    </tr>
                </tfoot>
            </Table>
            </div>


            <Modal 
                show={settingmodal} 
                onHide={() => closesettingmodal()}
                backdrop="static"  
                keyboard={false}  
                    >
                    <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form >
                            <div className='row'>
                            <div className='col-md-4'>
                                <label htmlFor="Like">Like</label>
                                <select value={shared_blog_details.like} id='Like' name='Like' onChange={(e) => setshared_blog_details({ ...shared_blog_details, like: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                    <option value="true">Enable</option>
                                    <option value="false">Disable</option>
                                </select>
                            </div>
                            <div className='col-md-4'>
                                <label htmlFor="Comment">Comment</label>
                                <select value={shared_blog_details.comment} id='Comment' name='Comment' onChange={(e) => setshared_blog_details({ ...shared_blog_details, comment: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                    <option value="true">Enable</option>
                                    <option value="false">Disable</option>
                                </select>
                            </div>
                            <div className='col-md-4'>
                                <label htmlFor="Share">Share</label>
                                <select value={shared_blog_details.share} id='Share' name='Share' onChange={(e) => setshared_blog_details({ ...shared_blog_details, share: e.target.value=='true'?true:false })} className="form-select form-select-lg">
                                    <option value="true">Enable</option>
                                    <option value="false">Disable</option>
                                </select>
                            </div>
                        </div>
                            </Form>
                </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" type="button" onClick={() => closesettingmodal()} > Cancel </Button>
                        <Button variant="primary" type="button" onClick={() => UpdateBlogSetting()}>Update</Button>
                    </Modal.Footer>           
                </Modal>
        </>
    );
}