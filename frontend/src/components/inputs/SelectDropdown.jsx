import React, { useState } from "react";
import "@fortawesome/react-fontawesome";
import "../../CSS/TaskManagerCSS/SelectDropdown.css";

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="select-dropdown-container">
            {/* Dropdown button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="select-dropdown-button"
            >
                {value ? options.find((opt) => opt.value === value)?.label : placeholder}
                <span className="dropdown-arrow">
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`dropdown-item ${
                                value === option.value ? "selected" : ""
                            }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectDropdown;