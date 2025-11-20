import './../Css/Findfriend.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
export default function Findfriends(){
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
            document.title = "MERN Technology || Find New Friends";
            if (LOGIN_USER === false) {
                navigate('/');
                return;
            }
            if (firstCall.current) {
                firstCall.current = false;
                return;
            }
            AllUsers()
        }, [currentpage]);

    async function AllUsers() {
        try {
            if (listloader) {
                return false;
            }
            setlistloader(true);
            setTimeout(async ()=>{
                let url = `${API_URL}/find-friends?page=${currentpage}&limit=${limit}`;
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
                        console.log(data);
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

    return (
       <>
        <div className="container-fluid">
            <div className="row">
            <div className="col-md-9 find-friends  mt-1">
             <div className='row'>
{datalist.map((item, index) =>
                <div className='col-md-3' key={index}>
                <div className="card m-2" >
                        <div className='image-div'>
                        {
                            item.user_file_dtl.filesize == "" ? 
                            <><img src='/images/image-not-found.png' className="card-img-top" title={item.title} loading="lazy"/></>
                                :  
                            <><img src={item.user_file_dtl.file_view_path} className="card-img-top" title={item.title} loading="lazy"/></>
                        }
                        </div>
                        <div className="card-body">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        <a href="#" className="btn btn-primary">Go somewhere</a>
                        </div>
                    </div>
                </div>
)
}


             </div>
        {listloader==true ? <>Loading..</> : <></>}
            </div>
            <div className="col-md-3 text-center">
                <Userslist/>
            </div>
            </div>
        </div>
        </>
    )
}