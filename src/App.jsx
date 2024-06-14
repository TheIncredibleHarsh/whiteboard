import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Slider from 'react-input-slider'
import './App.css'

function App() {
  const [eraser, setEraser] = useState(false)
  const [paint, setPaint] = useState(false)
  const [coord, setCoord] = useState({x: 0, y: 0})
  const [lineWidth, setLineWidth] = useState(1)
  const [strokeColor, setStrokeColor] = useState("black")

  const canvas = useRef();
  const customCursor = useRef();

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext('2d');
  })

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
  }

  const stopPaint = (e) => {
    setPaint(false);
    const c = canvas.current;
    const ctx = c.getContext('2d');
    
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
      <div className="absolute top-0">
        <input className={"p-3 border-2 " + (eraser ? 'bg-gray-300' : 'bg-green-400')} type="button" value={"Paint"} onClick={changeMode}/>
        <input className={"p-3 border-2 " + (eraser ? 'bg-green-400' : 'bg-gray-300')} type="button" value={"Erase"} onClick={changeMode}/>
        <Slider className="mx-5" axis="x" xmin={1} xmax={100} x={lineWidth} onChange={(x) => setLineWidth(x.x)}/>
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
