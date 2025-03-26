import React from 'react';

const Card = ({ children, className, bgColor = "bg-white" }) => {
    return (
        <div className={`${bgColor} rounded-lg shadow-lg p-8 w-full max-w-md ${className}`}>
            {children}
        </div>
    );
};

export default Card;
