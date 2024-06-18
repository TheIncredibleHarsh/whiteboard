import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Slider from 'react-input-slider'
import './App.css'
import { app, analytics } from './firebase'

import socket from './socket'
import axios from 'axios'
// import useCookie from './hooks/useCookie'

function App() {
  const [eraser, setEraser] = useState(false);
  const [paint, setPaint] = useState(false);
  const [coord, setCoord] = useState({x: 0, y: 0});
  const [lineWidth, setLineWidth] = useState(1);
  const [strokeColor, setStrokeColor] = useState("black");
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [roomKey, setRoomKey] = useState();
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
      console.log(data);
      ctx.moveTo(data.coordinates.x, data.coordinates.y);
      ctx.beginPath();
    });

    socket.on('paint-draw', (data)=>{
      console.log(data);
      let coord = data.coordinates
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeColor
      ctx.lineTo(coord.x - c.offsetLeft, coord.y - c.offsetTop);
      ctx.stroke();
    });

    // socket.on('paint-stop', (data)=>{
    //   ctx.moveTo(data.coordinates.x, data.coordinates.y);
    //   ctx.beginPath();
    // });
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

  useEffect(() => {
    if(sessionId !== undefined && socketId !== undefined){
      let req = {
        sessionId: sessionId,
        socketId: socket.id
      }
      axios.post(`${hostName}/create-room`, JSON.stringify(req), {
        headers:{
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then((res)=>{
        // console.log(res.data.roomKey)
        {
          setRoomKey(res.data.roomKey);
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
    }

  }, [sessionId, socketId])

  
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

    var canvasDataUrl = c.toDataURL();
    // console.log(canvasDataUrl)
    socket.emit('network-paint-draw', {
      coordinates: currentCoord,
      roomKey: roomKey
    });
  }

  const changeMode = (e) => {
    if(e.target.value == 'Paint'){
      const c = canvas.current;
      const ctx = c.getContext('2d');
      ctx.globalCompositeOperation="source-over";
      setStrokeColor("black"); 
      setLineWidth(lineWidth); 
      setEraser(false)
    }else{
      const c = canvas.current;
      const ctx = c.getContext('2d');
      ctx.globalCompositeOperation="destination-out";
      setStrokeColor('rgb(0,0,0,1)');
      setLineWidth(lineWidth);
      setEraser(true)
    }
  }

  return (
    <>
      <div id='cursor' className={"custom-cursor z-10 " + (eraser ? '' : 'hidden')} ref={customCursor}></div>
      <div className="absolute top-0 flex flex-row items-center bg-slate-500 w-full">
        <input className={"p-3 border-2 " + (eraser ? 'bg-gray-300' : 'bg-green-400')} type="button" value={"Paint"} onClick={changeMode}/>
        <input className={"p-3 border-2 " + (eraser ? 'bg-green-400' : 'bg-gray-300')} type="button" value={"Erase"} onClick={changeMode}/>
        <div><Slider className="mx-5" axis="x" xmin={1} xmax={100} x={lineWidth} onChange={(x) => setLineWidth(x.x)}/></div>
        {showJoinPrompt ? 
          <div className='px-3 py-1 border-2 space-x-2'>
            <input className='rounded-lg border-2 p-2' type='text' placeholder='enter room key' ref={roomKeyInput}/>
            <input className='p-2 bg-green-200 rounded-lg' type='button' value={"join"} onClick={joinRoom}/>
            <input className='p-2 bg-green-200 rounded-lg' type='button' value={"cancel"} onClick={() => {
              setShowJoinPrompt(false)
            }} />
          </div> 
        : 
          <div className='px-3 py-1 border-2 space-x-2'>
            <input className='rounded-lg border-2 p-2' type='text' placeholder='room-key' value={roomKey} disabled/>
            <input className='p-2 bg-green-200 rounded-lg' type='button' value={"Join other room"} onClick={() => {
              setShowJoinPrompt(true)
            }} />
          </div>
        }
      </div>
      <canvas 
        className={"border-2 " + (eraser ? 'cursor-none':'cursor-[url(pencil.cur),_pointer]')}
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvas} 
        onMouseDown={startPaint} 
        onMouseUp={stopPaint} 
        onMouseMove={sketch}>
      </canvas>
    </>
  )
}

export default App
