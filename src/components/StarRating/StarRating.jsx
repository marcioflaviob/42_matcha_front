import React from 'react';
import { Rating } from 'primereact/rating';
import './StarRating.css';

const StarRating = ({ 
    value = 0, 
    isModifiable = false, 
    onChange = null, 
    showValue = true,
    className = '',
    size = 'medium' // 'small', 'medium', 'large'
}) => {
    const handleRatingChange = (e) => {
        if (isModifiable && onChange) {
            const starValue = e.value;
            const ratingValue = starValue * 20;
            onChange(ratingValue);
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small': return 'star-rating-small';
            case 'large': return 'star-rating-large';
            default: return 'star-rating-medium';
        }
    };

    return (
        <div className={`star-rating-container ${getSizeClass()} ${!isModifiable ? 'star-rating-readonly' : ''} ${className}`}>
            <Rating 
                value={Math.floor((value || 0) / 20)} 
                onChange={handleRatingChange}
                stars={5}
                cancel={isModifiable}
                readOnly={!isModifiable}
                className="star-rating"
            />
            {showValue && (
                <span className="star-rating-value">
                    {value || 0}/100
                </span>
            )}
        </div>
    );
};

export default StarRating;
