import './../Css/Home.css';
import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL,Truncatetext } from './Constant.jsx';
import Blogloader from './Blogloader.jsx';
import Userslist from './Userslist.jsx';
import { Post_With_Htoken } from '../Services/Https.jsx';
import swal from 'sweetalert';
import moment from "moment";
function Home(){
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();

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
    function changePage(page){
        setcurrentpage(page)
    }

    return (
        <>
        <div className="container-fluid">
            <div className="row">
            <div className="col-md-3 text-center">
               <h3>post list</h3>
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

export default Home;