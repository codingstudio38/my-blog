import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, USER_DETAILS, USER_LOGOUT } from './Constant';
import { Post_With_Htoken } from './../Services/Https';
import swal from 'sweetalert';
import Websocket from "./../Services/WebSocketService";
export default function Logout() {
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    useEffect(() => {
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
    }, []);
    const [loader, setLoader] = useState(false)
    async function Logout() {
        try {
            swal({
                title: "Are you sure?",
                text: "Are you sure that you want to logout?",
                icon: "warning",
                buttons: ["Cancel", "Yes, leave"],
                dangerMode: true,
            }).then(async (logout) => {
                if (logout) {
                    setLoader(true);
                    let url = `${API_URL}/user-logout`;
                    let myform = JSON.stringify({});
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
                            USER_LOGOUT()
                            navigate('/');
                            Websocket.disconnect();
                            swal({
                                title: `You have successfully logged out!`,
                                icon: "success",
                            })
                        } else {
                            swal({
                                title: `${data?.message}`,
                                icon: "warning",
                            })
                        }
                    } else {
                        // swal("Cancelled", "Ok.", "info");
                    }
                }
            });
        } catch (error) {
            setLoader(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    return (
        <>
            <button className='btn btn-sm btn-primary' onClick={() => Logout()} type="buttom"
                disabled={loader == true ? "disabled" : null} >
                {loader ?
                    "Please Wait.."
                    :
                    "Logout"
                }

            </button>
        </>
    );
}