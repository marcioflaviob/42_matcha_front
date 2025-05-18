import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
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
    const [peer, setPeer] = useState(null);
    const [channel, setChannel] = useState(null);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [waitingForAcceptance, setWaitingForAcceptance] = useState(true);
    const [callStarted, setCallStarted] = useState(false);
    const navigate = useNavigate();

    const handleHangUp = () => {
        if (peer) peer.destroy();
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        console.log('Call ended');
        console.log('Channel:', channel);
        console.log('Call started:', callStarted);
        if (channel && callStarted) {
            console.log('Triggering call ended event');
            channel.trigger('client-call-ended', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
            });
        }
        axios.post(`${import.meta.env.VITE_API_URL}/stop-call/${selectedUser.id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });
        setIsCalling(false);
        navigate('/chat');
    };

    // Initialize channel and request media permissions
    useEffect(() => {
        if (connected && pusher) {
            let channelName;
            if (user.id > selectedUser.id) {
                channelName = `presence-video-call-${user.id}-${selectedUser.id}`;
            } else {
                channelName = `presence-video-call-${selectedUser.id}-${user.id}`;
            }

            console.log('Subscribing to channel:', channelName);

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
        console.log('Initializing peer connection');
        
        // Create the SimplePeer instance
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
            console.log('Generated signal to send!:', signal);
            channel.trigger('client-signal', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
                signal,
            });
        });

        newPeer.on('stream', (incomingStream) => {
            setRemoteStream(incomingStream);

            console.log('Received remote stream:', incomingStream);
            
            // Ensure remoteVideoRef exists and set the stream
            // if (remoteVideoRef.current) {
            //     remoteVideoRef.current.srcObject = incomingStream;
            //     remoteVideoRef.current.play()
            //         .catch(err => console.error('Error playing remote video:', err));
            // }
            
            setConnectionEstablished(true);
        });

        newPeer.on('connect', () => {
            console.log('Peer connection established!');
            displayAlert('success', 'Connected to newPeer');
        });

        newPeer.on('error', (err) => {
            console.error('Peer connection error:', err);
            displayAlert('error', 'Connection error');
        });

        newPeer.on('close', () => {
            console.log('Peer connection closed');
            handleHangUp();
        });

    }, [channel, selectedUser.id, stream, user.id, handleHangUp]);

    const handleAcceptCall = useCallback(() => {
        if (waitingForAcceptance) {
            console.log('Accepting call');
            setWaitingForAcceptance(false)
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
            console.log('Subscribing to channel:', channelName);
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
    }, [connected, pusher, selectedUser.id, stream, user.id]);

    // Only initialize peer after call is accepted
    // useEffect(() => {
    //     if (waitingForAcceptance && callStarted && channel && stream && !peer) {
    //         setUpPeerConnection();
    //     }
    // }, [channel, stream, peer, waitingForAcceptance, callStarted]);

    // Set up channel event bindings
    useEffect(() => {
        if (channel) {
            // Listen for call acceptance
            channel.bind('client-call-accepted', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    console.log('Call accepted by receiver');
                    setWaitingForAcceptance(false);
                    setUpPeerConnection();
                }
            });
            // Listen for call ended
            channel.bind('client-call-ended', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    displayAlert('info', `${selectedUser.first_name} ended the call`);
                    handleHangUp();
                }
            });
            // Listen for incoming signals
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

    // Accept call if invited
    useEffect(() => {
        if (channel && callStarted && isInvited) {
            handleAcceptCall();
        }
    }, [isInvited, channel, callStarted, handleAcceptCall]);

    // useEffect(() => {
    //     if (remoteStream && remoteVideoRef.current) {
    //         remoteVideoRef.current.srcObject = remoteStream;
    //         remoteVideoRef.current.play()
    //             .catch(err => console.error('Error playing remote video:', err));
    //     }
    // }, [remoteStream, remoteVideoRef]);

    return (
        <Dialog 
            visible={true} 
            onHide={handleHangUp} 
            header="Video Call" 
            className="call-dialog-container"
            closable={true}
        >
            {
                !permissionGranted ? <AwaitingPermissions setStream={setStream} setPermissionGranted={setPermissionGranted} /> :
                !callStarted ? <AwaitingCall isInvited={isInvited} selectedUser={selectedUser} setCallStarted={setCallStarted} stream={stream} channel={channel} handleHangUp={handleHangUp} /> :
                callStarted && waitingForAcceptance ? <AwaitingAcceptance selectedUser={selectedUser} stream={stream} handleHangUp={handleHangUp} /> :
                <ConnectedCall selectedUser={selectedUser} remoteStream={remoteStream} localStream={stream} handleHangUp={handleHangUp} connectionEstablished={connectionEstablished} />
            }
        </Dialog>
    );
};

export default CallDialog;