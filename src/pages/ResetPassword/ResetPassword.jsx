import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './ResetPassword.css';
import { displayAlert } from '../../components/Notification/Notification';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            displayAlert('warn', 'Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await axios.patch(import.meta.env.VITE_API_URL + '/users/reset-password', { password: newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess(true);
            displayAlert('success', 'Password reset successfully');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            console.error('Password reset failed:', err.response?.data || err.message);
            displayAlert('error', 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="reset-password-success">
                <h2>Password Reset Successfully</h2>
                <p>You can now log in with your new password.</p>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <h2>Reset Your Password</h2>
            <div className="input-group">
                <InputText
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div className="input-group">
                <InputText
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <Button
                label={loading ? 'Resetting...' : 'Reset Password'}
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
            />
        </div>
    );
};

export default ResetPassword;