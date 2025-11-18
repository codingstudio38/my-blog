import React, { useState, useEffect } from 'react';
import Logout from './Logout';
import { USER_DETAILS } from './Constant';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import './../Css/Header.css';


export default function Header(){
    const navigate = useNavigate();
    const LOGIN_USER = USER_DETAILS();
        useEffect(() => {
           
        }, []);
    return (
        <Navbar bg="primary" variant="dark">
            <Container>
                <Nav className="me-auto">
                    <NavLink className={"navlink"} to="/web/home">Home</NavLink>
                    <NavLink className={"navlink"} to="/web/create-blog">My blog</NavLink>
                    {/* <NavLink className={"navlink"} to="/web/my-profile">Profile</NavLink> */}
                </Nav>
                {
                    LOGIN_USER!==false?
                        <>
                            <Nav>
                                <NavDropdown title={LOGIN_USER.name}>
                                    <NavDropdown.Item onClick={() => { navigate('/web/my-profile') }}>Profile</NavDropdown.Item>
                                    <NavDropdown.Item ><Logout/></NavDropdown.Item>
                                </NavDropdown>
                            </Nav></>
                        : null
                }
            </Container>
        </Navbar>
    )
}