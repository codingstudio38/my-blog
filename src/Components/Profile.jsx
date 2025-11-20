import './../Css/Profile.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { USER_DETAILS, API_URL,USER_LOGOUT } from './Constant.jsx';
 import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
 import moment from "moment";
 export default function Profile() {
   const firstCall = useRef(true);
    const [currentpage, setcurrentpage] = useState(1);
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    const [loader, setLoader] = useState(false);
    const [total_rec, settotal_rec] = useState(0);
 
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
         EditRow(LOGIN_USER._id);
    }, []);

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
          <a href="#profile-post" className="nav-link" data-toggle="tab">
            POSTS
          </a>
        </li>
        <li className="nav-item">
          <a href="#profile-about" className="nav-link" data-toggle="tab">
            ABOUT
          </a>
        </li>
        <li className="nav-item">
          <a href="#profile-photos" className="nav-link" data-toggle="tab">
            PHOTOS
          </a>
        </li>
        <li className="nav-item">
          <a href="#profile-videos" className="nav-link" data-toggle="tab">
            VIDEOS
          </a>
        </li>
        <li className="nav-item">
          <a
            href="#profile-friends"
            className="nav-link active show"
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
            <div className="tab-pane fade active show" id="profile-friends">
              <div className="m-b-10">
                <b>Friend List (9)</b>
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
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar3.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Jonty Augusto</h4>
                      <p>128 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar4.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Androkles Allen</h4>
                      <p>12 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar5.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Ithamar Silvio</h4>
                      <p>1,923 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar6.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Denzel Annas</h4>
                      <p>893 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar7.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Kamil Cree</h4>
                      <p>983 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar8.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Fritjof Inderjit</h4>
                      <p>3,321 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar1.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Sushil Trygve</h4>
                      <p>921 friends</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="friend-img">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar2.png"
                        alt=""
                      />
                    </div>
                    <div className="friend-info">
                      <h4>Frans Gebhard</h4>
                      <p>944 friends</p>
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
              <div className="field">Phone No.:</div>
              <div className="value">{total > 0 ? editdata.phone : ''}</div>
            </li>
            <li className="title">FRIEND LIST (9)</li>
            <li className="img-list">
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar2.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar3.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar4.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar5.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar6.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar7.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar8.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar1.png"
                  alt=""
                />
              </a>
              <a href="#" className="m-b-5">
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar2.png"
                  alt=""
                />
              </a>
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