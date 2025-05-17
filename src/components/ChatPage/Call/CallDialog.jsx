import { Dialog } from 'primereact/dialog';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { displayAlert } from '../../Notification/Notification';
import { SocketContext } from '../../../context/SocketContext';
import { UserContext } from '../../../context/UserContext';
import SimplePeer from 'simple-peer';
import './CallDialog.css';
import AwaitingPermissions from './AwaitingPermissions';
import AwaitingCall from './AwaitingCall';
import AwaitingAcceptance from './AwaitingAcceptance';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConnectedCall from './ConnectedCall';

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
    const [waitingForAcceptance, setWaitingForAcceptance] = useState(false);
    const [callStarted, setCallStarted] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
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

    useEffect(() => {
        if (stream && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            
            const playPromise = localVideoRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .catch(err => {
                        console.error('Error playing local video:', err);
                        // Try again after a short delay
                        setTimeout(() => {
                            localVideoRef.current.play()
                                .catch(err => console.error('Second attempt error:', err));
                        }, 1000);
                    });
            }
        }
    }, [stream, localVideoRef]);

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
            
            
            // Request camera and microphone permissions
            // navigator.mediaDevices
            //     .getUserMedia({ 
            //         video: {
            //             width: { ideal: 640 },
            //             height: { ideal: 480 },
            //             facingMode: "user"
            //         }, 
            //         audio: true 
            //     })
            //     .then((mediaStream) => {
            //         console.log("Media stream obtained successfully");
            //         setStream(mediaStream);
            //         setPermissionGranted(true);
            //     })
            //     .catch((err) => {
            //         console.error('Media access error:', err);
            //         displayAlert('error', 'Unable to access camera or microphone. Please grant permissions.');
            //     });

            return () => {
                newChannel.unbind_all();
                pusher.unsubscribe(channelName);
                if (peer) peer.destroy();
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    }, [connected, pusher]);

    useEffect(() => {
        if (channel && stream && !peer) {
            initializePeerConnection();
        } else {
            console.log('Peer already initialized or channel/stream not available');
        }
    }, [channel, stream]);

    // Set up channel event bindings
    useEffect(() => {
        if (channel && stream) { // TODO Peer shouldn't be checked here because I want it to be created only when the call is accepted
            console.log('Channel created');
            // Listen for call acceptance
            channel.bind('client-call-accepted', (data) => {
                console.log('Call accepted:', data);
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    console.log('Call accepted by remote user');
                    setCallAccepted(true);
                }
            });

            // Listen for call ended
            channel.bind('client-call-ended', (data) => {
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id) {
                    displayAlert('info', `${selectedUser.first_name} ended the call`);
                    handleHangUp();
                }
            });

            // Listen for incoming signals (only process after peer is created)
            channel.bind('client-signal', (data) => {
                console.log('Received signal from remote peer:', data.signal);
                if (data.receiver_id === user.id && data.sender_id === selectedUser.id && peer) {
                    try {
                        peer.signal(data.signal);
                    } catch (err) {
                        console.error('Error processing signal:', err);
                    }
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
    }, [channel, stream]);

    // Initialize the peer connection when accepted
    const initializePeerConnection = () => {
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

        // Set up event handlers for the peer
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
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = incomingStream;
                remoteVideoRef.current.play()
                    .catch(err => console.error('Error playing remote video:', err));
            }
            
            setConnectionEstablished(true);
        });

        newPeer.on('connect', () => {
            console.log('Peer connection established!');
            displayAlert('success', 'Connected to peer');
        });

        newPeer.on('error', (err) => {
            console.error('Peer connection error:', err);
            displayAlert('error', 'Connection error');
        });

        newPeer.on('close', () => {
            console.log('Peer connection closed');
            handleHangUp();
        });

        setPeer(newPeer);
    };

    // Handle accept call
    const handleAcceptCall = () => {
        if (!callAccepted) {
            console.log('Accepting call');
            setCallAccepted(true);
            channel.trigger('client-call-accepted', {
                sender_id: user.id,
                receiver_id: selectedUser.id,
            });
            // initializePeerConnection();
        }
    };

    useEffect(() => {
        if (channel && isInvited) {
            handleAcceptCall();
        }
    }, [isInvited, channel]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play()
                .catch(err => console.error('Error playing remote video:', err));
        }
    }, [remoteStream]);

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
                !callStarted ? <AwaitingCall isInvited={isInvited} selectedUser={selectedUser} localVideoRef={localVideoRef} setWaitingForAcceptance={setWaitingForAcceptance} setCallStarted={setCallStarted} channel={channel} handleHangUp={handleHangUp} /> :
                callStarted && !callAccepted && waitingForAcceptance ? <AwaitingAcceptance selectedUser={selectedUser} localVideoRef={localVideoRef} handleHangUp={handleHangUp} /> :
                <ConnectedCall selectedUser={selectedUser} remoteVideoRef={remoteVideoRef} localVideoRef={localVideoRef} connectionEstablished={connectionEstablished} handleHangUp={handleHangUp} />
            }
        </Dialog>
    );
};

export default CallDialog;