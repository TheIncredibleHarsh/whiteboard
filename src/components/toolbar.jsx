import { IconPencil, IconEraser, IconInnerShadowTopRight } from "@tabler/icons-react";
import { useState } from "react";
function Toolbar({setPenSize, changeMode, setPenColor}){
    const [showEraserPopUp, setShowEraserPopUp] = useState(false);
    const [mouseOnPenTool, setMouseOnPenTool] = useState(false);
    const [mouseOnPenPanel, setMouseOnPenPanel] = useState(false);
    const [mouseOnEraserTool, setMouseOnEraserTool] = useState(false);
    const [mouseOnEraserPanel, setMouseOnEraserPanel] = useState(false);
    const [mouseOnColorTool, setMouseOnColorTool] = useState(false);
    const [mouseOnColorPanel, setMouseOnColorPanel] = useState(false);
    const [currentPenSize, setCurrentPenSize] = useState(2)
    const [currentEraserSize, setCurrentEraserSize] = useState(2)
    const [currentColor, setCurrentColor] = useState('')
    const [activeTool, setActiveTool] = useState('Pen')

    const changePenSize = (size) => {
        changeMode('Paint');
        setPenSize(size);
        setCurrentPenSize(size);
        setActiveTool('Pen')
    }

    const changeEraserSize = (size) => {
        changeMode('Erase');
        setPenSize(size);
        setCurrentEraserSize(size);
        setActiveTool('Eraser')
    }

    const changePenColor = (color) => {
        console.log('here')
        setPenColor(color)
        setCurrentColor(color)
    }

    const colorMap = [
        '#BF1A2F', 
        '#2667FF',
        '#D6D84F',
        '#00100B',
        '#70EE9C',
        '#4C2A85'
    ]

    return (
        <div>
            <div className={"bg-slate-300 rounded-2xl fixed left-4 top-52 flex flex-col items-center py-4 px-2 space-y-4"}>
                <div className={activeTool === 'Pen' ? "bg-slate-400 p-1 rounded-lg" : ""} onMouseOver={() => setMouseOnPenTool(true)} onMouseOut={() => setMouseOnPenTool(false)} ><IconPencil size={32}/>
                    {
                        (mouseOnPenTool || mouseOnPenPanel) ? <PenPopUp setMouseOnPenPanel={setMouseOnPenPanel} changePenSize={changePenSize} currentSize={currentPenSize}/> : ""
                    }
                </div>
                <div className={activeTool === 'Eraser' ? "bg-slate-400 p-1 rounded-lg" : ""} onMouseOver={() => setMouseOnEraserTool(true)} onMouseOut={() => setMouseOnEraserTool(false)} ><IconEraser size={32} />
                    {
                        (mouseOnEraserTool || mouseOnEraserPanel) ? <EraserPopUp setMouseOnEraserPanel={setMouseOnEraserPanel} changeEraserSize={changeEraserSize} currentSize={currentEraserSize}/> : ""
                    }
                </div>
                <div onMouseOver={() => setMouseOnColorTool(true)} onMouseOut={() => setMouseOnColorTool(false)} ><IconInnerShadowTopRight size={32} />
                    {
                        (mouseOnColorTool || mouseOnColorPanel) ? <ColorPickerPopUp colorMap={colorMap} setMouseOnEraserPanel={setMouseOnColorPanel} changePenColor={changePenColor}/> : ""
                    }
                </div>
            </div>
        </div>
    );
}

function PenPopUp({setMouseOnPenPanel, changePenSize, currentSize}){
    return (
        <div className={"flex flex-row fixed left-14 top-52"} >
            <div className="w-6 h-32"></div>
            <div className="border-2 bg-slate-200 rounded-lg space-y-6 flex flex-col items-center p-2" onMouseOver={() => {setMouseOnPenPanel(true)}} onMouseOut={() => setMouseOnPenPanel(false)}>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 2    ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changePenSize(2)}><div className="h-1 w-28 bg-slate-700 rounded-lg" ></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 8    ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changePenSize(8)}><div className="h-2 w-28 bg-slate-700 rounded-lg" ></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 12   ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changePenSize(12)}><div className="h-3 w-28 bg-slate-700 rounded-lg"></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 24   ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changePenSize(24)}><div className="h-4 w-28 bg-slate-700 rounded-lg"></div></div>
            </div>
        </div>
    );
}

function EraserPopUp({setMouseOnEraserPanel, changeEraserSize, currentSize}){
    return (
        <div className={"flex flex-row fixed left-14 top-64"} >
            <div className="w-6 h-32"></div>
            <div className="border-2 bg-slate-200 rounded-lg space-y-6 flex flex-col items-center p-2" onMouseOver={() => {setMouseOnEraserPanel(true)}} onMouseOut={() => setMouseOnEraserPanel(false)}>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 8    ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changeEraserSize(8)}><div className="h-1 w-28    bg-white rounded-lg" ></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 16    ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changeEraserSize(16)}><div className="h-2 w-28    bg-white rounded-lg" ></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 32   ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changeEraserSize(32)}><div className="h-3 w-28   bg-white rounded-lg"></div></div>
                <div className={"hover:bg-slate-100 p-3 rounded-lg " + (currentSize == 64   ? 'border border-3 border-dotted border-slate-700' : '')} onClick={()=>changeEraserSize(64)}><div className="h-4 w-28   bg-white rounded-lg"></div></div>
            </div>
        </div>
    );
}

function ColorPickerPopUp({colorMap, changePenColor, setMouseOnColorPanel}){
    return (
        <div className={"flex flex-row fixed left-14 top-80"} >
            <div className="w-6"></div>
            <div className="border-2 bg-slate-200 rounded-lg space-x-4 flex flex-row flex-wrap justify-center p-2 z-20" onMouseOver={() => {setMouseOnColorPanel(true)}} onMouseOut={() => setMouseOnColorPanel(false)}>
                {colorMap.map((color)=>{
                    return (
                        <div className={"hover:bg-slate-100 p-3 rounded-lg"} onClick={()=>changePenColor(color)}><div className={`h-8 w-8`} style={{backgroundColor: color}}></div></div>
                    );
                })}
            </div>
        </div>
    );
}

export default Toolbar;