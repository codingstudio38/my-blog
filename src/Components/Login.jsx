import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, USER_DETAILS,SET_SESSION,REMOVE_SESSION } from './Constant';
import { Post_Without_Htoken } from './../Services/Https';
import Websocket from './../Services/WebSocketService';
import swal from 'sweetalert';
function Login() {
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
    useEffect(() => {
        document.title = "MERN Technology || User - Login";
        document.body.style.backgroundColor = "aliceblue";
        if (!LOGIN_USER === false) {
            navigate('/web/home');
            return;
        }
    }, []);

    const [btndisable, setDtndisable] = useState(false);
    const [details, setDetails] = useState({
        "email": "",
        "password": ""
    });
    async function postFormData() {
        try {
            setDtndisable(true);
            let url = `${API_URL}/user-login`;
            let myform = JSON.stringify(details);
            let headers = {
                'Content-Type': 'application/json',
            };
            let response = await Post_Without_Htoken(myform, url, headers);
            setDtndisable(false);
             if(response!==""){
                response = await response.json();
                const data = response;
                if (data.status == 200) {
                    REMOVE_SESSION('buserinfo')
                    SET_SESSION('buserinfo',JSON.stringify(data.user))
                    //  Websocket.connect();
                    navigate('/web/home');
                } else {
                    swal({
                        title: `${data?.message}`,
                        icon: "warning",
                    })
                }
            }
        } catch (error) {
            setDtndisable(false);
            swal({
                title: `Unknow error:- ${error.message}`,
                icon: "error",
            })
        }
    }
    return (
        <>
            <section className="vh-100" style={{ backgroundColor: '#eee' }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: '25px' }}>
                                <div className="card-body p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign In</p>
                                            <form className="mx-1 mx-md-4">

                                                <div className="d-flex flex-row align-items-center mb-4">
                                                    <i className="fas fa-envelope fa-lg me-3 fa-fw" />
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="email" id="form3Example3c" className="form-control" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
                                                        <label className="form-label" htmlFor="form3Example3c">Your Email</label>
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-row align-items-center mb-4">
                                                    <i className="fas fa-lock fa-lg me-3 fa-fw" />
                                                    <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                                        <input type="password" id="form3Example4c" className="form-control" value={details.password} onChange={(e) => setDetails({ ...details, password: e.target.value })} />
                                                        <label className="form-label" htmlFor="form3Example4c">Password</label>
                                                    </div>
                                                </div>

                                                <div className="form-check d-flex justify-content-center mb-5">
                                                    <label className="form-check-label" htmlFor="form2Example3">
                                                        I don't have an account. <a style={{ "cursor": "pointer", "textDecoration": "underline", "color": "#0202ff" }} onClick={() => { navigate('/register') }}>Register</a>
                                                    </label>
                                                </div>
                                                <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                    <button type="button" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg" onClick={() => postFormData()} disabled={btndisable==true ? "disabled" : null} >
                                                        {btndisable ?
                                                            "Loding.."
                                                            :
                                                            "Login"
                                                        }
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                                            <img src="/images/img4.webp" className="img-fluid" alt="Sample image" />
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

export default Login;