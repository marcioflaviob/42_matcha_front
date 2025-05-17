import React, { useContext, useEffect, useState } from 'react';
import './ConversationHeader.css';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { displayAlert } from '../Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CallDialog from './Call/CallDialog';

const ConversationHeader = ({ selectedUser, setSelectedUser, setUsers }) => {
	const { token } = useContext(AuthContext);
	const [isCalling, setIsCalling] = useState(false);
	const [isInvited, setIsInvited] = useState(false);
	const profilePicture = selectedUser?.pictures.find(picture => picture.is_profile)?.url || '';
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const handleCall = () => {
		// displayAlert('info', 'This feature is not available yet');
		setIsCalling(true);
	}
	
	const confirmBlockUser = () => {
		confirmDialog({
			message: `Are you sure you want to block ${selectedUser.first_name}?`,
			header: 'Confirmation',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Yes',
			rejectLabel: 'No',
			acceptClassName: 'p-button-danger',
			accept: handleBlockUser,
		});
	}
	
	const handleBlockUser = async () => {
		try {
			const response = await axios.post(import.meta.env.VITE_API_URL + `/block/${selectedUser.id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.status === 200) {
				displayAlert('success', `You have blocked ${selectedUser.first_name}`);
				setUsers((prevUsers) => {
					const updatedUsers = prevUsers.filter(user => user.id !== selectedUser.id);
					setSelectedUser(null);
					return updatedUsers;
				});
			}
		} catch (error) {
			console.error('Error blocking user:', error);
			displayAlert('error', 'Error blocking user');
		}
	}
	
	useEffect(() => {
		const calling = searchParams.get('call');
		const userId = searchParams.get('id');
		if (calling && (!userId || selectedUser.id == userId)) {
			setIsCalling(true);
			setIsInvited(true);
		} else if (calling && selectedUser.id != userId) {
			displayAlert('warn', 'User not found');
		}
	}, [searchParams, selectedUser]);

	return (
		<div className="conversation-header">
			<ConfirmDialog />
			{isCalling && <CallDialog selectedUser={selectedUser} setIsCalling={setIsCalling} isInvited={isInvited} />}
			<div className='user-info-header' onClick={() => navigate('/profile/' + selectedUser.id)}>
				<Avatar image={import.meta.env.VITE_BLOB_URL + '/' + profilePicture} shape="circle" size='xlarge' />
				<div className="header-info">
					<span className="header-name">{selectedUser.first_name} {selectedUser.last_name}</span>
				</div>
			</div>
			<div className="header-actions">
				<Button icon="pi pi-video"
					className="header-action-button header-action-call" rounded
					tooltip={`Call ${selectedUser.first_name}`} tooltipOptions={{ position: 'bottom' }} 
					onClick={handleCall} />
				<Button icon="pi pi-ban"
					className="header-action-button header-action-block" rounded
					tooltip={`Block ${selectedUser.first_name}`} tooltipOptions={{ position: 'left' }} 
					onClick={confirmBlockUser} />
			</div>
		</div>
	);
};

export default ConversationHeader;