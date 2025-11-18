import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL } from './Constant.jsx';
import Ckeditor from './Ckeditor.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
// import Header from './Header.jsx';
import { Pagination } from 'antd';
import Table from 'react-bootstrap/Table';
import { Modal, Button } from "react-bootstrap";
export default function Createblog() {
    const [currentpage, setcurrentpage] = useState(1);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const childRef = useRef();
    const [loader, setLoader] = useState(false);
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(5);
    const [total_rec, settotal_rec] = useState(0);

    const [blog_details, setBdetails] = useState({
        "id":"",
        "edit":false,
        "user_id":LOGIN_USER._id,
        "title": "",
        "content": "",
        "photo": "",
        "file_view_path": "",
    });

    useEffect(() => {
        document.title = "MERN Technology || User - Create Blog";
        // document.body.style.backgroundColor = "aliceblue";
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
         Myblogs();
    }, [currentpage]);

    
    async function Myblogs() {
        try {
            setlistloader(true);
            let url = `${API_URL}/my-blogs?page=${currentpage}&limit=${limit}`;
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

    async function DeleteRow(row) {
        try {
            swal({
                title: "Are you sure?",
                text: "Are you sure that you want to delete the recode?",
                icon: "warning",
                buttons: ["Cancel", "Yes"],
                dangerMode: true,
            }).then(async (d) => {
                if (d) {
                    let url = `${API_URL}/delete-blogs/${row._id}`;
                    let myform = JSON.stringify({user_id:LOGIN_USER._id,id:row._id});
                    let headers = {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${LOGIN_USER.token}`,
                    };
                    let response = await Post_With_Htoken(myform, url, headers);
                    if(response!==""){
                    response = await response.json();
                    const data = response;
                    if (data.status == 200) {
                        setDatelist([]);
                        settotal_rec(0);
                        setcurrentpage(1);
                        setlimit(5);
                        Myblogs();
                        swal({
                            title: `Successfully deleted`,
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
    async function EditRow(row) {
        try {
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
                            "edit":true,
                            "id":blog._id,
                            "user_id":blog.user_id,
                            "title": blog.title,
                            "content": blog.content,
                            "photo": blog.photo,
                            "file_view_path": blog.photo!==null ? blog.file_dtl.file_view_path :"",
                        }
                    })
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
                setDatelist([]);
                settotal_rec(0);
                setcurrentpage(1);
                setlimit(5);
                Myblogs();
                setBdetails((data) => {
                    return {
                        "edit":false,
                        "id":"",
                        "user_id": LOGIN_USER._id,
                        "title": "",
                        "content": "",
                        "photo": "",
                        "file_view_path": "",
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
    return (
        <>
            {/* <Header /> */}
            <section className="vh-100">
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-9">
                            <h1 className="mb-4 text-dark text-decoration-underline">Create Blog</h1>
                            <div className="card" style={{ borderRadius: '15px' }}>
                                <div className="card-body">
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
                                            <h6 className="mb-0">Content</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                                <Ckeditor getcontent={getEditorData} ckid={"editor"} ref={childRef}/>
                                        </div>
                                    </div>
                                    <hr className="mx-n3" />
                                    <div className="row align-items-center py-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Upload Photo</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <div className='row'>
                                                <div className="col-md-8">
                                                    <input className="form-control form-control-lg" id="photo" type="file" accept="image/*" onChange={(e) => UploadPhoto(e)} disabled={loader == true ? "disabled" : null} />
                                                    <div className="small text-muted mt-2">Allow only images. Max file size 2 MB</div>
                                                </div>
                                                <div className="col-md-4">
                                                    <>
                                                        {blog_details.photo !== ""
                                                            ?
                                                            <>
                                                                <img src={blog_details.file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                            </>
                                                            :
                                                            <></>
                                                        }
                                                    </>
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
<br/><br/><br/><br/><br/><br/>
            <div className='container'>
                <h2 style={{ textAlign: "center" }}>My Blogs</h2>
            <Table striped bordered hover>
                <thead>
                    {/* <tr>
                        <th colSpan={7}>
                             <select id='limit' name='limit' onChange={(e) => changeperPage(e)} className='limit' defaultValue={5}>
                                <option value="5">Limit</option>
                                {
                                    limitval.map((item, index) =>
                                        <option value={item} key={index}>{item}</option>
                                    )
                                }
                            </select> *
                        </th>

                    </tr> */}
                    <tr>
                        <th className='th-center'>#</th>
                        <th className='th-center'>User Name</th>
                        <th className='th-center'>Title</th>
                        <th className='th-center'>Content</th>
                        <th className='th-center'>Blog Photo</th>
                        <th className='th-center'>Created Date</th>
                        <th className='th-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {listloader==true ? 
                    <tr>
                        <td className='td-center' colSpan={7}>Loading..</td>
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
                                <td align='center'>{item.title}</td>
                                <td align='center'>
                                    {item.content!==null || item.content!=="" ? <>
                                    Available
                                    {/* <div dangerouslySetInnerHTML={{ __html: item.content }} /> */}
                                    </> : <>Not Available</>}
                                </td>
                                <td align='center'>
                                    {

                                        item.file_dtl.filesize == "" ?
                                            <span className='text-danger'>Not Available</span>
                                            :  <>
                                                    <img src={item.file_dtl.file_view_path} style={{ "height": "60px", "width": "60px" }} />
                                                </>
                                    }
                                </td>
                                <td align='center'>{item.created_at} / {item.updated_at}</td>
                                <td align='center'>
                                    <button type='button' className='btn btn-warning btn-sm' onClick={() => EditRow(item)}>
                                        Edit
                                    </button>
                                    <button type='button' className='btn btn-danger btn-sm' style={{ marginLeft: '4px' }} onClick={() => DeleteRow(item)}>
                                       Delete
                                    </button>
                                </td>
                            </tr>
                        )
                    
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={7} align='center'>
                            <Pagination pageSize={limit} total={total_rec} current={currentpage} onChange={(value) => changePage(value)} showQuickJumper />
                        </td>
                    </tr>
                </tfoot>
            </Table>
            </div>
        </>
    );
}