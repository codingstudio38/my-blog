import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { USER_DETAILS } from './Constant';
function Protected(props) {
    const navigate = useNavigate();
    useEffect(() => {
        if (USER_DETAILS()==false) {
            navigate('../');
            return;
        }
    }, [])
    let Cmp = props.Component
    return (
        <>
            <Cmp></Cmp>
        </>
    )
}
export default Protected;