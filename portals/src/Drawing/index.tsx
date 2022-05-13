import React, { useEffect, useRef, useState } from "react";

type Point = [number, number]

interface Command {
  path: Point[]
}

const width = 500;
const height = 500;

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingPath, setDrawingPath] = useState<Point[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [commands, setCommands] = useState<Command[]>([]);
  const [frame, setFrame] = useState(0)

  useEffect(() => {
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
      // ctx.fillStyle = 'white';
      // ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'black';

      for (let i = 0; i <= commandIndex; i++) {
        const path = commands[i].path;
        if (path.length > 2) {
          console.log(`draw path ${i}`, path.length);
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (let j = 1; j < path.length; j++) {
            ctx.lineTo(path[j][0], path[j][1]);
          }
          // ctx.closePath();
          ctx.stroke();
        }
      }

    }

  }, [commandIndex]);

  const onTouchStart = (evt: React.TouchEvent) => {
    //  console.log('touch start', evt)
    if (ctx && evt.touches.length > 0) {
      const finger = evt.touches[0];
      ctx.beginPath();
      ctx.moveTo(finger.clientX, finger.clientY);
      ctx.strokeStyle = 'blue';

      setDrawingPath([[finger.clientX, finger.clientY]])
    }
  };
  const onTouchMove = (evt: React.TouchEvent) => {
    //  console.log('touch move', evt)
    if (ctx && evt.touches.length > 0 && drawingPath) {
      const finger = evt.touches[0];
      ctx.lineTo(finger.clientX, finger.clientY);
      ctx.stroke();
      const newPath = drawingPath.concat([[finger.clientX, finger.clientY]]);
      setDrawingPath(newPath);
    }
  };
  const onTouchEnd = (evt: React.TouchEvent) => {
    //  console.log('touch end', evt)

    if (ctx) {
      // ctx.closePath();
      // ctx.stroke();

      const cmd = { path: [...drawingPath] }
      setCommands(commands.concat([cmd]));
      setCommandIndex(commandIndex + 1);

      setDrawingPath([]);
    }
  };

  const onUndo = (evt: React.MouseEvent) => {
    if (commandIndex === 0) return;
    console.log('undo');
    setCommandIndex(commandIndex - 1);
  }

  const onRedo = (evt: React.MouseEvent) => {
    if (commandIndex === commands.length - 1) return;
    console.log('redo');
    setCommandIndex(commandIndex + 1);
  }

  return (<>
    <canvas width={width} height={height}
      ref={canvasRef} style={{ border: "1px solid grey" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    ></canvas>
    <button onClick={onUndo} disabled={commandIndex === 0}>Undo</button>
    <button onClick={onRedo} disabled={commandIndex === commands.length - 1}>Redo</button>
  </>);
}

export default Page;