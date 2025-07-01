import { useContext, useEffect, useState } from 'react';
import './ConversationHeader.css';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { displayAlert } from '../Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CallDialog from './Call/CallDialog';
import { MapContext } from '../../context/MapContext';

const ConversationHeader = ({ selectedUser, setSelectedUser, setUsers }) => {
	const { token } = useContext(AuthContext);
	const { setMapStatus, setFocusedUser } = useContext(MapContext)
	const [isCalling, setIsCalling] = useState(false);
	const [isInvited, setIsInvited] = useState(false);
	const profilePicture = selectedUser?.pictures.find(picture => picture.is_profile)?.url || '';
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const handleCall = () => {
		console.log('Initiating new call - resetting states');
		// Reset states for a fresh call
		setIsInvited(false);
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
			displayAlert('error', error.response?.data?.message || 'Failed to block user');
		}
	}

	const handleProfileClick = async () => {
		navigate('/profile/' + selectedUser.id);
	}

	const getRelativeTime = (lastSeen) => {
		const now = new Date();
		const lastSeenDate = new Date(lastSeen);
		const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
		
		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;
		
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;
		
		return lastSeenDate.toLocaleDateString();
	};
	
	useEffect(() => {
		const calling = searchParams.get('call');
		const userId = searchParams.get('id');
		if (calling && (!userId || selectedUser.id == userId)) {
			setIsCalling(true);
			setIsInvited(true);
		} else if (calling && selectedUser.id != userId) {
			displayAlert('warn', 'User not found');
		}
		setFocusedUser(selectedUser);
	}, [searchParams, selectedUser]);

	// Reset call states when selectedUser changes
	useEffect(() => {
		console.log('Selected user changed, resetting call states');
		setIsCalling(false);
		setIsInvited(false);
	}, [selectedUser.id]);

	return (
		<div className="conversation-header">
			<ConfirmDialog />
			{isCalling && <CallDialog selectedUser={selectedUser} setIsCalling={setIsCalling} isInvited={isInvited} />}
			<div className='user-info-header' onClick={handleProfileClick}>
				<Avatar 
					image={import.meta.env.VITE_BLOB_URL + '/' + profilePicture} 
					shape="circle" 
					size='xlarge'
					className={selectedUser?.online ? 'online' : 'offline'}
				/>
				<div className="header-info">
					<span className="header-name">{selectedUser.first_name} {selectedUser.last_name}</span>
					<div className="header-status-container">
						<span className={`header-status ${selectedUser?.online ? 'online' : 'offline'}`}>
							{selectedUser?.online ? 'Online' : 'Offline'}
						</span>
						{!selectedUser?.online && selectedUser?.last_connection && (
							<span className="header-last-seen">
								last seen {getRelativeTime(selectedUser?.last_connection)}
							</span>
						)}
					</div>
				</div>
			</div>
			<div className="header-actions">
				<Button icon="pi pi-calendar"
					className="header-action-button header-action-call" rounded
					tooltip={`Schedule a Date`} tooltipOptions={{ position: 'bottom' }} 
					onClick={() => {setMapStatus("setting_date")}}/>
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