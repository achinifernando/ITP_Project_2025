import React, { useState } from "react";
import "../../CSS/TaskManagerCSS/Login.css"; // import CSS file
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, label, placeholder, type }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    
    return (
        <div className="input-container">
            <label className="input-label">{label}</label>

            <div className="input-wrapper">
                <input
                    type={type === "password" ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    className="input-field"
                    value={value}
                    onChange={onChange}
                />

                {type === "password" && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleShowPassword}
                    >
                        {showPassword ? (
                            <FaRegEyeSlash size={18} />
                        ) : (
                            <FaRegEye size={18} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;