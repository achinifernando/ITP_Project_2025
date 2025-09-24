import React from "react";

const Progress = () => {
    const getColor = () => {
        switch (status) {
            case "In Progress":
                return "";

            case "Completed":
                return "";

            default:
                return "";
        }
    }

    return (
        <div className="">
            <div className={`$getColor()`}></div>
        </div>
    )

}

export default Progress;
