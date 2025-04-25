import React, { useContext, useState, useEffect } from 'react';
import './EmailValidation.css';
import { Button } from 'primereact/button';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { displayAlert } from '../../Notification/Notification';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';

const EmailValidation = () => {
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isButtonActive, setIsButtonActive] = useState(true);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        const validationToken = searchParams.get('token');
        if (validationToken) {
            validateEmail(validationToken);
        }
    }, [searchParams]);

    const validateEmail = async (validationToken) => {
        setValidating(true);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/email/validate`, {}, {
                    headers: {
                        Authorization: `Bearer ${validationToken}`,
                    }
                }
            );
            
            if (response.data) {
                setUser(response.data);
                displayAlert('success', 'Email successfully validated!');
                
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (error) {
            console.error('Error validating email:', error);
            displayAlert('error', 'Invalid or expired token');
        } finally {
            setValidating(false);
        }
    };

    const handleEmailResend = async () => {
        setIsButtonActive(false);
        axios.post(`${import.meta.env.VITE_API_URL}/email/validate`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(() => {
            displayAlert('success', 'Validation email sent');
        })
        .catch((error) => {
            console.error('Error resending email:', error);
            displayAlert('error', 'Error resending email');
        });
    };

    return (
        <div className="validation-div">
            {validating ? (
                <>
                    <h2>Validating your email...</h2>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                </>
            ) : (
                <>
                    <h2>Validate your account</h2>
                    <p>We have sent you an email with a link to validate your account.</p>
                    <p>Click on the link in the email to validate your account.</p>
                    <Button 
                        label="Resend email" 
                        disabled={!isButtonActive} 
                        onClick={handleEmailResend} 
                        icon="pi pi-envelope" 
                        iconPos="right" 
                    />
                </>
            )}
        </div>
    );
};

export default EmailValidation;