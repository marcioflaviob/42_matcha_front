import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SimplePeer from 'simple-peer';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { SocketContext } from '../../../context/SocketContext';
import { UserContext } from '../../../context/UserContext';
import { AuthContext } from '../../../context/AuthContext';
import { displayAlert } from '../../Notification/Notification';
import AwaitingPermissions from './AwaitingPermissions';
import AwaitingCall from './AwaitingCall';
import AwaitingAcceptance from './AwaitingAcceptance';
import ConnectedCall from './ConnectedCall';
import './CallDialog.css';

const CallDialog = ({ selectedUser, setIsCalling, isInvited }) => {
    const { connected, pusher } = useContext(SocketContext);
    const { user } = useContext(UserContext);
    const { token } = useContext(AuthContext);
    
    const isMountedRef = useRef(true);
    
    const [peer, setPeer] = useState(null);
    const [channel, setChannel] = useState(null);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [waitingForAcceptance, setWaitingForAcceptance] = useState(true);
    const [callStarted, setCallStarted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('CallDialog mounted/user changed. isInvited:', isInvited);
        
        setPeer(null);
        setChannel(null);
        setStream(null);
        setRemoteStream(null);
        setConnectionEstablished(false);
        setPermissionGranted(false);
        setWaitingForAcceptance(true);
        setCallStarted(false);
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, [selectedUser.id, isInvited]);

    const handleHangUp = useCallback(async () => {
        console.log('Hanging up call');
        
        if (peer) {
            peer.destroy();
            setPeer(null);
        }
        
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            setRemoteStream(null);
        }
        
        if (channel) {
            await channel.trigger('client-call-ended', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
            });
        }
        
        axios.post(`${import.meta.env.VITE_API_URL}/stop-call/${selectedUser.id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        }).catch(error => {
            console.error('Error stopping call:', error);
        });
        
        setIsCalling(false);
        navigate('/chat');
    }, [peer, stream, remoteStream, channel, callStarted, user.id, selectedUser.id, token, setIsCalling, navigate]);

    useEffect(() => {
        if (connected && pusher) {
            let channelName;
            if (user.id > selectedUser.id) {
                channelName = `presence-video-call-${user.id}-${selectedUser.id}`;
            } else {
                channelName = `presence-video-call-${selectedUser.id}-${user.id}`;
            }

            const newChannel = pusher.subscribe(channelName);
            setChannel(newChannel);

            return () => {
                newChannel.unbind_all();
                pusher.unsubscribe(channelName);
                if (peer) peer.destroy();
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    }, [connected, pusher, selectedUser.id, user.id]);

    const setUpPeerConnection = useCallback(() => {
        const newPeer = new SimplePeer({
            initiator: user.id < selectedUser.id,
            trickle: true,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        setPeer(newPeer);

        newPeer.on('signal', (signal) => {
            channel.trigger('client-signal', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
                signal,
            });
        });

        newPeer.on('stream', (incomingStream) => {
            setRemoteStream(incomingStream);
            setConnectionEstablished(true);
        });

        newPeer.on('connect', () => {
        });

        newPeer.on('error', (err) => {
            console.error('Peer connection error:', err);
            displayAlert('error', 'Connection error');
        });

        newPeer.on('close', () => {
            handleHangUp();
        });

    }, [channel, selectedUser.id, stream, user.id, handleHangUp]);

    const handleAcceptCall = useCallback(() => {
        if (waitingForAcceptance) {
            setWaitingForAcceptance(false);
            console.log('Call accepted, setting up peer connection');
            channel.trigger('client-call-accepted', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
            });
            setUpPeerConnection();
        }
    }, [waitingForAcceptance, channel, selectedUser.id, user.id, setUpPeerConnection]);

    useEffect(() => {
        if (connected && pusher) {
            let channelName;
            if (user.id > selectedUser.id) {
                channelName = `presence-video-call-${user.id}-${selectedUser.id}`;
            } else {
                channelName = `presence-video-call-${selectedUser.id}-${user.id}`;
            }

            const newChannel = pusher.subscribe(channelName);
            setChannel(newChannel);

            console.log('Subscribed to channel:', channelName);

            return () => {
                newChannel.unbind_all();
                pusher.unsubscribe(channelName);
                if (peer) peer.destroy();
                if (stream) { 
                    stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    }, [connected, pusher, selectedUser.id, stream, user.id]);

    useEffect(() => {
        if (channel) {

            channel.bind('client-call-accepted', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    setWaitingForAcceptance(false);
                    setUpPeerConnection();
                }
            });

            channel.bind('client-call-ended', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    displayAlert('info', `${selectedUser.first_name} ended the call`);
                    handleHangUp();
                }
            });

            channel.bind('client-signal', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id && peer) {
                    peer.signal(data.signal);
                }
            });
        }
        return () => {
            if (channel) {
                channel.unbind('client-call-accepted');
                channel.unbind('client-call-ended');
                channel.unbind('client-signal');
            }
        };
    }, [channel, handleHangUp, peer, selectedUser.first_name, selectedUser.id, user.id, setUpPeerConnection]);

    useEffect(() => {
        if (channel && callStarted && isInvited) {
            console.log('Call started, accepting call');
            handleAcceptCall();
        }
    }, [isInvited, channel, callStarted, handleAcceptCall]);

    useEffect(() => {
        console.log('Waiting for acceptance:', waitingForAcceptance);
    }, [waitingForAcceptance])

    const renderDialog = () => {
        if (!permissionGranted) {
            return <AwaitingPermissions setStream={setStream} setPermissionGranted={setPermissionGranted} />;
        } else if (!callStarted) {
            return <AwaitingCall isInvited={isInvited} selectedUser={selectedUser} setCallStarted={setCallStarted} stream={stream} channel={channel} handleHangUp={handleHangUp} />;
        } else if (waitingForAcceptance) {
            return <AwaitingAcceptance selectedUser={selectedUser} stream={stream} handleHangUp={handleHangUp} />;
        } else {
            return <ConnectedCall selectedUser={selectedUser} remoteStream={remoteStream} localStream={stream} handleHangUp={handleHangUp} connectionEstablished={connectionEstablished} />;
        }
    };

    return (
        <Dialog 
            visible={true} 
            onHide={handleHangUp} 
            header="Video Call" 
            className="call-dialog-container"
            closable={true}
            resizable={true}
            style={{ 
                width: connectionEstablished ? '80vw' : '800px', 
                height: connectionEstablished ? '60vh' : '600px' 
            }}
            contentStyle={{ padding: '1rem', height: '100%' }}
        >
            { renderDialog() }
        </Dialog>
    );
};

export default CallDialog;