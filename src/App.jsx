import { useEffect, useRef, useState } from 'react'
import Toolbar from './components/toolbar'
import Slider from 'react-input-slider'
import './App.css'

import socket from './socket'
import axios from 'axios'

function App() {
  const [eraser, setEraser] = useState(false);
  const [paint, setPaint] = useState(false);
  const [compositionMode, setCompositionMode] = useState('source-over')
  const [coord, setCoord] = useState({x: 0, y: 0});
  const [lineWidth, setLineWidth] = useState(1);
  const [strokeColor, setStrokeColor] = useState("black");
  const [roomKey, setRoomKey] = useState();
  const [connectedToRoom, setConnectedToRoom] = useState(false);
  const [socketId, setSocketId] = useState();

  const canvas = useRef();
  const customCursor = useRef();
  const roomKeyInput = useRef();

  const [sessionId, setSessionId] = useState();
  const [isRoomAdmin, setIsRoomAdmin] = useState(true);
  const hostName = 'http://localhost:4000';

  socket.on("connect", ()=>{
    setSocketId(socket.id);
  })

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext('2d');

    socket.on('paint-start', (data)=>{
      ctx.moveTo(data.coordinates.x, data.coordinates.y);
      ctx.beginPath();
    });

    socket.on('paint-draw', (data)=>{
      if(data.sessionId == sessionId){
        return
      }
      let coord = data.coordinates
      ctx.lineWidth = data.pen.lineWidth;
      let currentCompositionMode = ctx.globalCompositeOperation;
      if(data.pen.erase){
        ctx.globalCompositeOperation="destination-out";
        setStrokeColor('rgb(0,0,0,1)');
      }
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeColor
      ctx.lineTo(coord.x - c.offsetLeft, coord.y - c.offsetTop);
      ctx.stroke();
    });

    socket.on('paint-stop', (data)=>{
      ctx.globalCompositeOperation = compositionMode
    });
  }, [])

  useEffect(() => {
    var sesid = localStorage.getItem('sessionid');
    if(sesid == null || sesid === ''){
      sesid = crypto.randomUUID()
      localStorage.setItem('sessionid', sesid);
    }
    setSessionId(sesid);

    const c = canvas.current;
    const ctx = c.getContext('2d');
  }, []);

  const createRoom = () => {
    if(!sessionId && !socket.id){
      return false;
    }
    let req = {
      sessionId: sessionId,
      socketId: socket.id
    }

    axios.post(`${hostName}/create-room`, JSON.stringify(req), {
      headers:{
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then((res)=>{
      {
        setRoomKey(res.data.roomKey);
        setConnectedToRoom(true);
        return res.data.roomKey;
      }
    })
    .then((key)=>{
      socket.emit('connect-to-room', {
        roomKey: key
      })
    })
    .catch(function (error) {
      console.log(error);
    });

    return true;
  }
  
  const joinRoom = () => {
    const roomKey = roomKeyInput.current.value;
    if(roomKey == null)
      return
    let req = {
      sessionId: sessionId,
      socketId: socket.id
    }
    axios.post(`${hostName}/join-room/${roomKey}`, req)
      .then((res)=>{
        if(res.data.success){
          setIsRoomAdmin(false)
          setRoomKey(res.data.roomKey)
          setConnectedToRoom(true);
          socket.emit('connect-to-room', {
            roomKey: roomKey
          })
        }
      }).catch(function (error) {
        console.log(error);
      });
  }


  useEffect(() => {
    const cursor = customCursor.current;
    cursor.style.width = lineWidth+"px";
    cursor.style.height = lineWidth+"px";
  }, [lineWidth])

  const startPaint = (e) => {
    setPaint(true);
    let currentCoord = {x: e.clientX, y: e.clientY}
    setCoord(currentCoord);
    const c = canvas.current;
    const ctx = c.getContext('2d');
    ctx.moveTo(coord.x, coord.y);
    ctx.beginPath();
    ctx.globalCompositeOperation = compositionMode

    socket.emit('network-paint-start', {
      coordinates: currentCoord,
      roomKey: roomKey
    });
  }

  const stopPaint = (e) => {
    setPaint(false);
    socket.emit('network-paint-stop', {
      coordinates: coord,
      roomKey: roomKey
    });
  }

  const sketch = (e) => {
    var cursor = document.getElementById("cursor");
    let currentCoord = {x: e.clientX- e.target.offsetLeft, y: e.clientY - e.target.offsetTop}
    setCoord(currentCoord);
    cursor.style.left = coord.x+"px";
    cursor.style.top = coord.y+"px";
    if (!paint) return;
    const c = canvas.current;
    const ctx = c.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColor
    ctx.lineTo(coord.x - e.target.offsetLeft, coord.y - e.target.offsetTop);
    ctx.stroke();

    socket.emit('network-paint-draw', {
      coordinates: currentCoord,
      roomKey: roomKey,
      sessionId: sessionId,
      pen: {
        lineWidth: lineWidth,
        erase: eraser
      },
    });
  }

  const changeMode = (mode) => {
    if(mode === 'Paint'){
      const c = canvas.current;
      const ctx = c.getContext('2d');
      setCompositionMode('source-over')
      setStrokeColor(strokeColor); 
      setLineWidth(lineWidth); 
      setEraser(false)
    }else{
      const c = canvas.current;
      const ctx = c.getContext('2d');
      ctx.globalCompositeOperation="destination-out";
      setCompositionMode('destination-out')
      setStrokeColor('rgb(0,0,0,1)');
      setLineWidth(lineWidth);
      setEraser(true)
    }
  }

  return (
    <>
      <div id='cursor' className={"custom-cursor z-10"} ref={customCursor}></div>
      <div className="absolute top-0 flex items-center bg-slate-500 w-full p-3 flex-row-reverse justify-between">
        {!connectedToRoom ? 
          <div className='px-3 py-1 space-x-2'>
            <input className='rounded-lg border-2 p-2' type='text' placeholder='enter room key' ref={roomKeyInput}/>
            <input className='p-2 bg-green-200 rounded-lg' type='button' value={"join"} onClick={joinRoom}/>
            <span>Or</span>
            <input className='p-2 bg-yellow-200 rounded-lg' type='button' value={"create new Room"} onClick={() => {
              createRoom()
            }} />
          </div> 
        : 
          <div className='px-3 py-1 border-2 space-x-2'>
            <input className='rounded-lg border-2 p-2' type='text' placeholder='room-key' value={roomKey} ref={roomKeyInput} disabled/>
            <input className='p-2 bg-green-200 rounded-lg' type='button' value={"Leave Room"} onClick={() => {
              setConnectedToRoom(false);
              setRoomKey("");
              roomKeyInput.current.value = null;
            }} />
          </div>
        }
        <div>
          <span className={"text-3xl px-5 font-semibold text-white"}>Sketch</span>
        </div>
      </div>
      <canvas 
        className={"border-2 cursor-none"}
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvas} 
        onMouseDown={startPaint} 
        onMouseUp={stopPaint} 
        onMouseMove={sketch}>
      </canvas>

      <Toolbar 
        setPenSize = {setLineWidth}
        changeMode = {changeMode}
        setPenColor = {setStrokeColor}
      />
    </>
  )
}

export default App
