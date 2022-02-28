import React, { createContext, useState, useRef, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import Peer from 'simple-peer';
import UrlStore from './store/urlStore';
import { ChatModel } from './modules/chatModel';

const SocketContext = createContext(null);

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(undefined);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [chatModel, setChatModel] = useState(new ChatModel());
  const [hubConnection, setHubConnection] = useState(null);
  const [peerMedic, setPeerMedic] = useState(null);
  const [peerPacient, setPeerPacient] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

      if (chatModel.clinicaId) {
        let hubConnectionLocal = new HubConnectionBuilder()
            .withUrl(UrlStore.urlEmimChat + '?clinicaId=' + chatModel.clinicaId)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        hubConnectionLocal.start().catch(error => console.log('chat hub nu s-a putut conecta : ', error))
            .then(result => {
            console.log("SignalR s-a conectat ");
            });

        hubConnectionLocal.on('NeedADoctor', (currentChatModel) => {
            console.log("onNeedADoctor, callerName = "+ chatModel.pacientName);
            if(chatModel.pacientName === currentChatModel.pacientName) {
                console.log('Pacientul si-a autoprimit cererea proprie');
                return;
            }
            setChatModel(currentChatModel);
            setCall({ isReceivingCall: true, name:currentChatModel.pacientName });
        });
      
        setHubConnection(hubConnectionLocal);
    }
  }, [chatModel.clinicaId, chatModel.pacientName]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

            peer.on('signal', (data) => {
                console.log('answerCall - raspund, trimit signal');
                let currentChatModel = chatModel;
                currentChatModel.medicSignal = JSON.stringify(data);
                currentChatModel.medicName = name;
                setChatModel(currentChatModel);
                try {
                    hubConnection.invoke('DoctorFound', currentChatModel); 
                } catch (error) {
                    console.log(error);
                }
            });

            peer.on('stream', (currentStream) => {
                userVideo.current.srcObject = currentStream;
            });

            peer.signal(chatModel.pacientSignal);

            peer.on('connect', () => {
                console.log('medic Peer connected------>>>>')
            })

    setPeerMedic(peer);
  }

    
  const callMedic = () => {
    console.log('callMedic');

        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
            console.log('callMedic - trimit signal');
            let currentChatModel = chatModel;
            currentChatModel.pacientName = name;
            currentChatModel.pacientSignal = JSON.stringify(data);
            setChatModel(currentChatModel);
            try {
                hubConnection.invoke('NeedADoctor', currentChatModel); 
            } catch (error) {
                console.log('Err la needADoctor ' + error);
            }
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        peer.on('connect', () => {
            console.log('pacient Peer connected------>>>>')
        })

        setPeerPacient(peer);

        hubConnection.on('DoctorFound', (currentChatModel) => {
            console.log('am primit DoctorFound');
            if(chatModel.medicName === currentChatModel.medicName){
                console.log('am primit doctorFound tot de la mine, nu fac nimic...');
                return;
            }
    
            setCallAccepted(true);
            peer.signal(currentChatModel.medicSignal);
    
        })
    
  };

  const stopHubConnection = () => {
    console.log("stopHubConnection - opresc SignaR ");
    hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
  }
  

  const leaveCall = () => {
    setCallEnded(true);
    peerPacient?.destroy();
    peerMedic?.destroy();
    stopHubConnection();

    window.location.reload(); //luci TODO, de ce sa resetez totul?
  };


  return (
    <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            callMedic,
            leaveCall,
            answerCall,
            stopHubConnection,
            }}
        >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
