import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Header from './Header.jsx';
function Adminindex() {
    const navigate = useNavigate();
    const location = useLocation();
    const L1 = location.pathname === "/web" ? true : false;
    const L2 = location.pathname === "/web/" ? true : false;
    useEffect(() => {
        // navigate('/cpanel/view');
        // document.body.style.backgroundColor = "white";
        if (L1) {
            navigate('../web/home')
        }
        if (L2) {
            navigate('../web/home')
        }
    }, [])
    return (
        <>
            <Header />
            <Outlet></Outlet>
        </>
    )
}
export default Adminindex;