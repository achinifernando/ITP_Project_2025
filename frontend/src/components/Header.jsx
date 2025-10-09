import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import logoImg from "../assets/Nimal-Eng-logo.jpeg"
import "../CSS/ClientPortalCSS/header.css"

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lorryTypes, setLorryTypes] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Fetch categories, lorry types, and services on component mount
  useEffect(() => {
    fetchSearchData();
  }, []);

  const fetchSearchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await axios.get("http://localhost:5000/lorryCategories/products");
      setCategories(categoriesRes.data);

      // Fetch lorry types
      const typesRes = await axios.get("http://localhost:5000/lorryType/types");
      setLorryTypes(typesRes.data);

      // Fetch services (if you have a services endpoint)
      const servicesRes = await axios.get("http://localhost:5000/services");
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("client");
    setIsLoggedIn(false);
    navigate("/home");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      performSearch(query);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Perform search across all data
  const performSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const results = [];

    // Search in categories
    categories.forEach(category => {
      if (category.category?.toLowerCase().includes(lowerCaseQuery) ||
          category.description?.toLowerCase().includes(lowerCaseQuery)) {
        results.push({
          id: category._id,
          name: category.category,
          type: "category",
          description: category.description,
          route: "/products"
        });
      }
    });

    // Search in lorry types
    lorryTypes.forEach(type => {
      if (type.typeName?.toLowerCase().includes(lowerCaseQuery) ||
          type.description?.toLowerCase().includes(lowerCaseQuery)) {
        results.push({
          id: type._id,
          name: type.typeName,
          type: "lorry type",
          description: type.description,
          route: "/products"
        });
      }
    });

    // Search in services
    services.forEach(service => {
      if (service.serviceType?.toLowerCase().includes(lowerCaseQuery) ||
          service.description?.toLowerCase().includes(lowerCaseQuery)) {
        results.push({
          id: service._id,
          name: service.serviceType,
          type: "service",
          description: service.description,
          route: "/services"
        });
      }
    });

    // Also include static pages
    const staticPages = [
      { id: "about", name: "About Us", type: "page", description: "Learn more about our company", route: "/about" },
      { id: "contact", name: "Contact Us", type: "page", description: "Get in touch with us", route: "/contact" },
      { id: "products", name: "Products", type: "page", description: "View our products", route: "/products" },
      { id: "services", name: "Services", type: "page", description: "View our services", route: "/services" },
    ];

    staticPages.forEach(page => {
      if (page.name.toLowerCase().includes(lowerCaseQuery) ||
          page.description.toLowerCase().includes(lowerCaseQuery)) {
        results.push(page);
      }
    });

    setSearchResults(results);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  // Handle search result click
  const handleResultClick = (result) => {
    if (result.type === "category" || result.type === "lorry type") {
      // Navigate to products page with filter or specific category
      navigate(`/products?search=${encodeURIComponent(result.name)}`);
    } else {
      navigate(result.route);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="main-navbar">
      <div className="logo">
        <img src={logoImg} alt="logo" />
      </div>

      <div className="main-navbar-links">
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

      <div className="search-container">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search categories, lorry types, services..." 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          <button type="submit" className="btn-search">Search</button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(result => (
              <div 
                key={`${result.type}-${result.id}`} 
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-content">
                  <span className="result-name">{result.name}</span>
                  <span className="result-type">{result.type}</span>
                  
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && searchQuery && searchResults.length === 0 && (
          <div className="search-results">
            <div className="search-result-item no-results">
              No results found for "{searchQuery}"
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;