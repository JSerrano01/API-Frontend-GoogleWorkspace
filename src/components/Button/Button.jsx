import React from 'react';

const Button = ({ children, onClick, type = "button" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="w-full px-4 py-2 bg-[#038C7F] text-white rounded-lg hover:bg-[#005652] focus:outline-none focus:ring-2 focus:ring-white"
        >
            {children}
        </button>
    );
};

export default Button;