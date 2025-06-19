import React from 'react';
import './ErrorPage.css';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className='error-page-container'>
            <div className='error-content'>
                <img 
                    src={import.meta.env.VITE_BLOB_URL + '/' + 'sad_cat-wXhqHEgDRcBPGjsOb5copxfaDG1wrr.jpg'}
                    alt="Sad Cat" 
                    className="error-cat-image"
                />
                <div className='error-text'>
                    <h1>404</h1>
                    <h2>Oops! Page Not Found</h2>
                    <p>The page you're looking for seems to have wandered off like a curious cat.</p>
                    <p>Don't worry, let's get you back on track!</p>
                    <Button 
                        label="Go Back Home"
                        icon="pi pi-home"
                        className="p-button-raised p-button-rounded error-home-button"
                        onClick={() => navigate('/')}
                    />
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;