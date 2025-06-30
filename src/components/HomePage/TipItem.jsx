import React from 'react';

const TipItem = ({ icon, text }) => {
    return (
        <div className='tip-item'>
            <i className={icon} />
            <span>{text}</span>
        </div>
    );
};

export default TipItem;