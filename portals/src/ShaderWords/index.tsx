import React, { useState } from "react";
import Canvas from './Canvas';
import { FontContext, FontContextType, fontDefault } from './context';
import { Texture, LinearFilter } from 'three';

const imageWidth = 300;
const imageHeight = 423;
const msg = "I am my own muse, the subject I know best.";

function createTextTexture(fontSize: number, fontColor: string, angle = 0, repeat = false) {
  const canvas = document.createElement("canvas");
  const sampleCtx = canvas.getContext('2d');
  if (sampleCtx === null) { throw Error("can't create canvas context"); }

  const lineHeight = 1.05;
  const vAlign = "top";
  const fontStyle = `${fontSize}px Babylonica`;

  sampleCtx.textBaseline = vAlign;
  sampleCtx.font = fontStyle;
  const texSize = sampleCtx.measureText(`${msg}  `);

  const rowHeight = fontSize * lineHeight;
  canvas.width = texSize.width;
  canvas.height = rowHeight * 1.8;

  // We have to set the properties again after canvas changes size
  sampleCtx.textBaseline = vAlign;
  sampleCtx.font = fontStyle;
  sampleCtx.fillStyle = fontColor;
  sampleCtx.fillText(msg, 0, 0);

  const canvas2d = document.createElement("canvas");
  canvas2d.width = imageWidth;
  canvas2d.height = imageHeight;
  const sz = Math.max(imageWidth, imageHeight) * 2;
  const ctx = canvas2d.getContext('2d');
  if (ctx === null) { throw Error("can't create canvas context"); }
  ctx.save();
  ctx.translate(0.5 * sz, 0.5 * sz);
  ctx.rotate((Math.PI * angle) / 180);
  ctx.translate(-0.5 * sz, -0.5 * sz);
  ctx.fillStyle = "#ddd";
  ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  const pattern = ctx.createPattern(canvas, 'repeat');
  if (pattern === null) { throw Error("can't make pattern") }
  ctx.fillStyle = pattern;
  ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  ctx.translate(-0.55 * texSize.width, 0.95 * rowHeight);
  ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  if (repeat) {
    ctx.translate(0.55 * texSize.width, -0.95 * rowHeight);
    ctx.translate(0.25 * texSize.width, 0.5 * rowHeight);
    ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
    ctx.translate(0.75 * texSize.width, -rowHeight);
    ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  }
  ctx.restore();

  const texture = new Texture(canvas2d);

  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}


const styles = {
  wrapper: {
    margin: "20px auto",
    width: "fit-content",
  },
  controls: {
    width: "300px",
    marginTop: "20px"
  },
  step: {
    width: "100%"
  },
  stepLabels: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",

    color: "#666",
    fontFamily: "sans-serif",
    fontSize: "12px"
  }
}

const Page = () => {
  const fontLoader = new FontFace('Babylonica', "url('fonts/babylonica.ttf')");
  const [font, setFont] = useState<FontContextType>(fontDefault);
  const [step, setStep] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);

  const createTextTextures = () => {
    const levels: Texture[] = [
      createTextTexture(60, '#aaa', angle),
      createTextTexture(24, '#999', angle),
      createTextTexture(8, '#333', angle, true)
    ]
    setFont({ isLoaded: true, levels });
  };

  if (!font.isLoaded) {
    fontLoader.load().then((font) => {
      document.fonts.add(font);
      createTextTextures();
    });
  }

  const onStepChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(evt.target.value);
    setStep(value);
  };

  const onAngleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(evt.target.value);
    setAngle(value);
    createTextTextures();
  }

  return (<FontContext.Provider value={font}>
    <div style={styles.wrapper}>
      <Canvas step={step} width={imageWidth} height={imageHeight} />
      <div style={styles.controls}>
        <div style={styles.stepLabels}>
          <span>&nbsp;</span>
          <span>Desaturate</span>
          <span>Posterize</span>
          <span>Shade</span>
        </div>
        <input type="range" min="0" max="3" value={step} disabled={!font.isLoaded} onChange={onStepChanged} style={styles.step} />
      </div>
      <input type="range" min="9" max="359" value={angle} onChange={onAngleChange} />
    </div>
  </FontContext.Provider >);
};

export default Page;