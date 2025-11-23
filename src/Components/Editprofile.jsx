import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,USER_LOGOUT } from './Constant.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import Ckeditor from './Ckeditor.jsx';
export default function Editprofile() {
    const [currentpage, setcurrentpage] = useState(1);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const [loader, setLoader] = useState(false);
    const [total_rec, settotal_rec] = useState(0);
    const childRef = useRef();
    const [blog_details, setBdetails] = useState({
    "id":LOGIN_USER._id,
    "name": "",
    "phone": "",
    "email": "",
    "password": "",
    "occupation": "", 
    "skills": "",
    "dob": "",
    "country": "",
    "address": "",
    "about_us":"",
    });
 
    useEffect(() => {
        document.title = "MERN Technology || User - Edit Profile";
        // document.body.style.backgroundColor = "aliceblue";
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
         EditRow(LOGIN_USER._id);
    }, []);

  

    async function UploadPhoto(event) {
        try {
            setLoader(true);
            let url = `${API_URL}/update-user-photo`;
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
                let data =  {...editdata,"photo": response.file_name, "file_view_path": response.result };
                seteditdata(data);
                swal({
                    title: `Successfully uploaded`,
                    icon: "success",
                })
                // console.log(editdata);
                event.target.value="";
            } else {
                seteditdata((data) => { return { ...data, "photo": "", "file_view_path": "" } })
                swal({
                    title: `${data?.message}`,
                    icon: "warning",
                })
            }
        }
        } catch (error) {
            setLoader(false);
            seteditdata((data) => { return { ...data, "photo": "", "file_view_path": "" } })
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
 
    const [editdata,seteditdata] = useState({
        "file_dtl":{ filetype_st: '', filetype: '', filesize: '', filename: '', file_path: '', file_view_path: '' },
        "photo":'',
        file_view_path:'',
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
                    
                    setBdetails((data)=>{
                        return {
                            "id":blog._id,
                            "name":blog.name,
                            "phone": blog.phone,
                            "email": blog.email,
                            "password":'',
                            "occupation": blog.occupation, 
                            "skills": blog.skills,
                            "dob": blog.dob,
                            "country": blog.country,
                            "address": blog.address,
                            "about_us": blog.about_us,
                        }
                    })
                    if (childRef.current) {
                        childRef.current.setckeditor('about_us',blog.about_us);
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
            let url = `${API_URL}/update-user`;
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
                // console.log(data);
                USER_LOGOUT()
                navigate('/');
                swal({
                    title: `Success`,
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
            setLoader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }

  const getEditorData = (data) => {
    setBdetails(prev => ({ ...prev, about_us: data }))
  };
    return (
        <>
            {/* <Header /> */}
            <section >
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-9">
                            <h1 className="mb-4 text-dark text-decoration-underline">Edit Profile</h1>
                            <div className="card" style={{ borderRadius: '15px' }}>
                                <div className="card-body">
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Name</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='name' value={blog_details.name} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Email ID</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="email" id='email' value={blog_details.email} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Phone No</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='phone' value={blog_details.phone} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Date Of Birth</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="date" id='dob' value={blog_details.dob} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, dob: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Skills</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='skills' value={blog_details.skills} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, skills: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Occupation</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='occupation' value={blog_details.occupation} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, occupation: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Country</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='country' value={blog_details.country} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, country: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Address</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='address' value={blog_details.address} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, address: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">About Us</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                             <Ckeditor getcontent={getEditorData} ckid={"about_us"} ref={childRef}/>
                                            {/* <input type="text" id='about_us' value={blog_details.about_us} className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, about_us: e.target.value })} /> */}
                                        </div>
                                    </div>
                                    <div className="row align-items-center pt-4 pb-3">
                                        <div className="col-md-3 ps-5">
                                            <h6 className="mb-0">Password</h6>
                                        </div>
                                        <div className="col-md-9 pe-5">
                                            <input type="text" id='password' className="form-control form-control-lg" onChange={(e) => setBdetails({ ...blog_details, password: e.target.value })} />
                                        </div>
                                    </div>
                                   
                                    <hr className="mx-n3" />
                                    <div className="px-5 py-4">

                                        <button type="button" onClick={()=>{UpdateBlog()}} data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg"
                                            disabled={loader == true ? "disabled" : null} >
                                            {loader ?
                                                "Loding.."
                                                :
                                                "Update"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="mt-5">
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-xl-9">
                            <h1 className="mb-4 text-dark text-decoration-underline">Update Profile Photo</h1>
                            <div className="card" style={{ borderRadius: '15px' }}>
                                <div className="card-body">
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
                                                        {total>0 && editdata.file_view_path!==""
                                                            ?
                                                            <>
                                                                <img src={editdata.file_view_path} style={{ "height": "120px", "width": "120px" }} />
                                                            </>
                                                            :
                                                            <></>
                                                        }
                                                    </>
                                                </div>
                                                
                                            </div>

                                        </div>
                                    </div>
                                  
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
 
        </>
    );
}