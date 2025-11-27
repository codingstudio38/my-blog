import './../Css/Home.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
import Allnotifications from './Allnotifications.jsx';
import { useParams } from "react-router-dom";
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
    <><img src='/images/image-not-found.png' title={item.title} loading="lazy"/></>
        :  
    <><img src={item.file_dtl.file_view_path} title={item.title} loading="lazy"/></>
: item.blog_type == "691beef0c2cfd41cc117ef71"  ? //music
    item.thumbnail_dtl.filesize == "" ? 
    <><img src='/images/image-not-found.png' title={item.title} loading="lazy"/></>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} title={item.title} loading="lazy"/></>
: item.blog_type == "691beef0c2cfd41cc117ef6f"  ? //video
    item.thumbnail_dtl.filesize == "" ? 
    <><img src='/images/image-not-found.png' title={item.title} loading="lazy"/>1</>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} title={item.title} loading="lazy"/></>
: item.blog_type == "691beef0c2cfd41cc117ef6e"  ? //reel
    item.thumbnail_dtl.filesize == "" ? 
    <><img src='/images/image-not-found.png' title={item.title} loading="lazy"/></>
        :  
    <><img src={item.thumbnail_dtl.file_view_path} title={item.title} loading="lazy"/></> 
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
                        <a href="">Read More</a>
                        </section>
            )
        }    
        {listloader==true ? <><Blogloader/></> : <></>}
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