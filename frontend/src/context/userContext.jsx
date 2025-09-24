import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUser = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Verify token and get user data
            axiosInstance.get(API_PATHS.AUTH.GET_PROFILE)
                .then(response => {
                    setUser({ ...response.data, token });
                })
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    // const updateUser = (userData) => {
    //     setUser(userData);
    //     if (userData.token) {
    //         localStorage.setItem("token", userData.token); // Save token
    //     }
    //     setLoading(false);
    // };

    // const clearUser = () => {
    //     setUser(null);
    //     localStorage.removeItem("token");
    //     setLoading(false);
    // };

     return (
        <UserContext.Provider value={{ user, loading, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;