import { io } from "socket.io-client";

const URL = "http://" + import.meta.env.VITE_HOSTNAME;
const socket = io(URL, {
    transports: ['websocket', 'polling', 'flashsocket']
});


export default socket; 