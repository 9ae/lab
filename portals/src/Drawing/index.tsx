import React, { useEffect, useRef, useState } from "react";

type Point = [number, number]

interface Command {
  path: Point[]
}

const width = 500;
const height = 500;

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingPath, setDrawingPath] = useState<Point[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    console.log('use effect');
    const canvas = canvasRef.current;
    if (canvas === null) {
      console.log('canvas not ready yet');
      return;
    }
    const _ctx = canvas.getContext('2d');
    if (!ctx && _ctx) {
      setCtx(_ctx);
    }

    if (ctx && drawingPath.length === 0 && commandIndex >= 0) {
      console.log('drawing', commandIndex);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'black';

      for (let i = 0; i <= commandIndex; i++) {
        const path = commands[i].path;
        if (path.length > 2) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let j = 1; j < path.length; j++) {
            ctx.lineTo(path[j][0], path[j][1]);
          }
          ctx.stroke();
        }
      }

    }

  }, [commandIndex]);

  const onTouchStart = (evt: React.TouchEvent) => {
    console.log('touch START', evt.touches.length)
    if (ctx && evt.touches.length === 1) {
      const finger = evt.touches[0];



      ctx.beginPath();
      ctx.moveTo(finger.clientX, finger.clientY);
      ctx.strokeStyle = 'blue';

      setDrawingPath([[finger.clientX, finger.clientY]])
    } else if (evt.touches.length === 2) {
      setDrawingPath([]);
      onUndo()
    } else if (evt.touches.length === 3) {
      setDrawingPath([]);
      onRedo();
    }
  };
  const onTouchMove = (evt: React.TouchEvent) => {
    if (ctx && evt.touches.length === 1 && drawingPath.length > 0) {

      if (commandIndex >= 0 && commandIndex < (commands.length - 1)) {
        setCommands(commands.slice(0, commandIndex + 1));
      }

      const finger = evt.touches[0];
      ctx.lineTo(finger.clientX, finger.clientY);
      ctx.stroke();
      const newPath = drawingPath.concat([[finger.clientX, finger.clientY]]);
      setDrawingPath(newPath);
    }
  };
  const onTouchEnd = (evt: React.TouchEvent) => {
    console.log('touch END', evt)
    if (ctx && drawingPath.length > 1) {
      const cmd = { path: [...drawingPath] }
      setCommands(commands.concat([cmd]));
      setCommandIndex(commandIndex + 1);
    }
    setDrawingPath([]);
  };


  const onUndo = () => {
    if (commandIndex < 0) return;
    console.log('undo');
    setCommandIndex(commandIndex - 1);
  }

  const onRedo = () => {
    if (commandIndex === commands.length - 1) return;
    console.log('redo');
    setCommandIndex(commandIndex + 1);
  }

  return (<div style={{ display: 'flex' }}>
    <canvas width={width} height={height}
      ref={canvasRef} style={{ border: "1px solid grey" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    ></canvas>
    <div>
      <button onClick={(evt: React.MouseEvent) => { onUndo() }} disabled={commandIndex < 0}>Undo</button>
      <button onClick={(evt: React.MouseEvent) => { onRedo() }} disabled={commandIndex === (commands.length - 1)}>Redo</button>
      <div style={{ width: '500px', height: '500px', overflow: 'scroll', background: '#eee' }}>
        {commands.map((c, i) => <p key={i} style={{ color: i === commandIndex ? 'blue' : 'grey' }}>[{i}]{c.path.length}</p>)}
      </div>
    </div>
  </div>);
}

export default Page;