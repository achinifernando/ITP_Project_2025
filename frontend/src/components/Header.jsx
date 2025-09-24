import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logoImg from "../assets/Nimal-Eng-logo.jpeg"
import "../CSS/header.css"


function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("client");
    setIsLoggedIn(false);
    navigate("/home");
  };

 

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logoImg} alt="logo" />
      </div>

      <div className="navbar-links">
        <Link to="/home" className="nav-link">HOME</Link>
        <Link to="/products" className="nav-link">PRODUCTS</Link>
        <Link to="/services" className="nav-link">SERVICES</Link>
        <Link to="/about" className="nav-link">ABOUT US</Link>
        <Link to="/contact" className="nav-link">CONTACT US</Link>

        
      </div>

      <div className="login-button">
        {!isLoggedIn ? (
          <>
            <button type="button" className="btn-login" onClick={() => navigate("/signup")}>Signup</button>
            <button type="button" className="btn-login" onClick={() => navigate("/login")}>Login</button>
          </>
        ) : (
          <>
            <button type="button" className="btn-login" onClick={() => navigate("/profilePage")}>Profile</button>
            <button type="button" className="btn-login" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      <div>
         <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Search" />
        <button type="submit" className="btn-search">Search</button>
      </form>
      </div>
 
    </nav>
  );
}

export default Header;
