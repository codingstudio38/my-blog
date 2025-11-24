import './../Css/Profile.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { USER_DETAILS, API_URL,USER_LOGOUT } from './Constant.jsx';
 import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
 import moment from "moment";
 import { Pagination } from 'antd';
 export default function Profile() {
   const firstCall = useRef(true);
   const firstCallcheck = useRef(true);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const [total_rec, settotal_rec] = useState(0);
    const [c_tabe, setc_tabe] = useState('profile-friends');
 
    const [listloader, setlistloader] = useState(false);
    const [datalist, setDatelist] = useState([]);
    const [limit, setlimit] = useState(12);
    const [total_friend_rec, settotal_friend_rec] = useState(0);
    const [currentpage, setcurrentpage] = useState(1);
    const [lastpage, setlastpage] = useState(1);
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
                        setlastpage((dataid) => { return data.result.lastpage });
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
          <a href="#"
            onClick={(e) => {
                e.preventDefault();
                setc_tabe('my-post');
            }}
            className={c_tabe=='my-post' ? 'nav-link active show' : 'nav-link'}
           data-toggle="tab">
            POSTS
          </a>
        </li>
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
                        <><img src='/images/image-not-found.png' title={item.name}  alt={item.name} loading="lazy"/></>
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
            <div className={c_tabe=='my-post' ? 'tab-pane fade active show' : 'tab-pane fade'} id="my-post">
              <div className="m-b-10 text-dark">
                <b>My Post (9)</b>
              </div>
              <ul className="friend-list clearfix">
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar2.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Sancho Aldo</h4>
                      <p>392 friends</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className={c_tabe=='about-us' ? 'tab-pane fade active show' : 'tab-pane fade'} id="about-us">
              <div className="m-b-10 text-dark">
                <b>About Us</b>
              </div>
              <div className='text-dark' dangerouslySetInnerHTML={{ __html: total > 0 ? editdata.about_us : '' }} />
            </div>
            <div className={c_tabe=='my-photo' ? 'tab-pane fade active show' : 'tab-pane fade'} id="my-photo">
              <div className="m-b-10 text-dark">
                <b>Photo</b>
              </div>
              <ul className="friend-list clearfix">
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar2.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Sancho Aldo</h4>
                      <p>392 friends</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className={c_tabe=='my-video' ? 'tab-pane fade active show' : 'tab-pane fade'} id="my-video">
              <div className="m-b-10 text-dark">
                <b>Vidoe</b>
              </div>
              <ul className="friend-list clearfix">
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar2.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Sancho Aldo</h4>
                      <p>392 friends</p>
                    </div>
                  </a>
                </li>
              </ul>
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
 
        </>
    );
}