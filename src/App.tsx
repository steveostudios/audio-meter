import React, { useEffect, useRef } from "react";
import "./App.css";
import styled from "@emotion/styled";
import { FreqInput } from "./components/FreqInput";
import { ColorInput } from "./components/ColorInput";
import { Microphone } from "./helpers/microphone";
import { NumberInput } from "./components/NumberInput";
import { SquishInput } from "./components/SquishInput";

interface Colors {
  [key: string]: string;
}

enum Mode {
  MIC = "mic",
  DEMO = "demo",
  SAVER = "saver",
}

const mic = new Microphone();

const App: React.FC = () => {
  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // state
  const [isStarted, setIsStarted] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>(Mode.MIC);
  const [controlPanel, setControlPanel] = React.useState(true);
  const [freq, setFreq] = React.useState([1, 2, 3, 4, 6, 8, 12, 16]);
  const [barHeights, setBarHeights] = React.useState(
    Array(freq.length).fill(0)
  );

  const [colors, setColors] = React.useState<Colors>({
    background: "#1e1e1e",
    grid: "#000000",
    base: "#203662",
    mid: "#55a2a8",
    peak: "#c5203f",
  });
  const [grid, setGrid] = React.useState({
    count: 40,
    width: 3,
    lock: false,
  });
  const [squish, setSquish] = React.useState([0, 0, 0, 0, 0, 0, 0, 0]);

  // const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);

  // useEffect(() => {
  //   mic.getDevices().then((devices: MediaDeviceInfo[]) => {
  //     setDevices(devices);
  //   });
  // }, []);

  useEffect(() => {
    let timeoutId = 0;

    const visualize = () => {
      const ctx = canvasRef.current?.getContext("2d");
      const micFreqs = mic.getFrequency();

      if (!ctx || !micFreqs) return;

      // clear canvas
      ctx.clearRect(0, 0, 800, 450);

      // draw background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, 800, 450);

      // setup gradient
      const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      grad.addColorStop(0, colors.peak);
      grad.addColorStop(0.5, colors.mid);
      grad.addColorStop(1, colors.base);

      const GRID_SIZE = 450 / grid.count; // 450 is the height of the canvas

      // draw fake bars
      // Update bar heights
      const newBarHeights = barHeights.map((height: number, i: number) => {
        const targetHeight = Math.random() * -ctx.canvas.height;
        const remainder = targetHeight % GRID_SIZE;
        const adjustedHeight =
          remainder !== 0 ? targetHeight - remainder : targetHeight;

        // Smoothly animate towards the target height
        const delta = (adjustedHeight - height) * 0.1; // Adjust the factor for speed
        return height + delta;
      });

      // setBarHeights(newBarHeights);

      // console.log(newBarHeights);

      // draw bars
      freq.map((f, i) => {
        const grad = ctx.createLinearGradient(
          0,
          ctx.canvas.height,
          0,
          ctx.canvas.height * (squish[i] || 0.1)
        );
        grad.addColorStop(1, colors.peak);
        grad.addColorStop(0.5, colors.mid);
        grad.addColorStop(0, colors.base);
        const value =
          mode === Mode.SAVER
            ? (newBarHeights[i] / -ctx.canvas.height) *
                (mic.getVolume() * 0.5) -
              squish[i]
            : mode === Mode.MIC
            ? micFreqs[f] - squish[i]
            : 1 - squish[i];
        const x = (i / freq.length) * ctx.canvas.width;
        const y = ctx.canvas.height;
        const width = ctx.canvas.width / freq.length;
        let height = value * -ctx.canvas.height;

        const remainder = height % GRID_SIZE;
        if (remainder !== 0 && grid.lock) {
          height = height - remainder; // Adjust height down to the nearest gridline
        }

        height = height + grid.width;

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, width, height);
        return null;
      });

      // draw grid
      for (let i = 0; i < grid.count; i++) {
        const y = (i / grid.count) * 450;
        ctx.fillStyle = colors.grid;
        ctx.fillRect(0, y, 800, grid.width);
      }

      timeoutId = window.setTimeout(visualize, 1000 / 60);
    };

    if (isStarted) {
      visualize();
    } else {
      window.clearTimeout(timeoutId);
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, 800, 450);
      ctx.clearRect(0, 0, 800, 450);
      return;
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [colors, freq, grid, mode, squish, isStarted, barHeights]);

  // change handlers
  const onToggleStart = () => {
    setIsStarted(!isStarted);
  };

  const onChangeMode = (value: Mode) => {
    setMode(value);
  };

  const onChangeColor = (id: string, value: string) => {
    setColors({ ...colors, [id]: value });
  };

  const onChangeFreq = (id: number, value: number) => {
    const newFreq = [...freq];
    newFreq[id] = value;
    setFreq(newFreq);
  };

  const onChangeSquish = (id: number, value: number) => {
    const newSquish = [...squish];
    newSquish[id] = value;
    setSquish(newSquish);
  };

  const onChangeGrid = (id: string, value: number) => {
    setGrid({ ...grid, [id]: value });
  };

  return (
    <Container>
      <Background color={colors.background}>
        <Canvas ref={canvasRef} width="800" height="450"></Canvas>
        {controlPanel && (
          <ControlPanel>
            <div>
              <h3>Source</h3>
              <ModeGroup>
                <ModeButton
                  onClick={() => onChangeMode(Mode.MIC)}
                  selected={mode === Mode.MIC}
                >
                  Mic
                </ModeButton>
                <ModeButton
                  onClick={() => onChangeMode(Mode.DEMO)}
                  selected={mode === Mode.DEMO}
                >
                  Demo
                </ModeButton>
                <ModeButton
                  onClick={() => onChangeMode(Mode.SAVER)}
                  selected={mode === Mode.SAVER}
                >
                  Saver
                </ModeButton>
              </ModeGroup>
              <input
                id="volume"
                type="range"
                value={mic.getVolume()}
                onChange={(e) => {
                  mic.setVolume(+e.target.value);
                  // setVolume(+e.target.value)
                }}
                step={0.1}
                min={0}
                max={20}
              />
              <label htmlFor="volume">Volume</label>

              <ModeButton onClick={onToggleStart} selected={isStarted}>
                {isStarted ? "Stop" : "Start"}
              </ModeButton>
            </div>
            <div>
              <h3>Frequencies</h3>
              {freq.map((f, i) => (
                <FreqInput
                  id={i}
                  key={i}
                  value={f}
                  onChange={onChangeFreq}
                  min={1}
                  max={mic.freqRange / 8}
                />
              ))}
            </div>
            <div>
              <h3>Squish</h3>
              {squish.map((s, i) => (
                <SquishInput
                  key={i}
                  id={i}
                  value={s}
                  onChange={onChangeSquish}
                />
              ))}
            </div>
            <div>
              <h3>Colors</h3>
              {Object.keys(colors).map((key) => (
                <ColorInput
                  key={key}
                  id={key}
                  label={key}
                  value={colors[key]}
                  onChange={onChangeColor}
                />
              ))}
            </div>
            <div>
              <h3>Grid</h3>
              <NumberInput
                id="count"
                label="Grid Count"
                value={grid.count}
                onChange={onChangeGrid}
              />
              <NumberInput
                id="width"
                label="Grid Width"
                value={grid.width}
                onChange={onChangeGrid}
              />
              <ModeButton
                onClick={() => setGrid({ ...grid, lock: !grid.lock })}
                selected={grid.lock}
              >
                {grid.lock ? "Locked to Grid" : "Lock to Grid"}
              </ModeButton>
            </div>
          </ControlPanel>
        )}
        {!controlPanel && (
          <ControlPanelToggleButton onClick={() => setControlPanel(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
            </svg>
          </ControlPanelToggleButton>
        )}
        {controlPanel && (
          <ControlPanelToggleButton onClick={() => setControlPanel(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
            </svg>
          </ControlPanelToggleButton>
        )}
      </Background>
    </Container>
  );
};

export default App;

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  color: "white",
  padding: 0,
  margin: 0,
  position: "relative",
});

const Background = styled("div")((props: { color: string }) => ({
  background: props.color || "#000000",
  width: "100%",
  display: "flex",
  height: "100%",
}));

const Canvas = styled("canvas")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
});

const ControlPanel = styled("div")({
  position: "absolute",
  top: "0",
  width: "calc(100% - 40px)",
  gap: "20px",
  display: "flex",
  flexDirection: "row",
  // justifyContent: "center",
  // alignItems: "center",
  padding: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  margin: "10px",
  "> div": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    h3: {
      margin: 0,
    },
  },
});

const ModeGroup = styled("div")({
  display: "flex",
});

const ModeButton = styled("button")((props: { selected: boolean }) => ({
  background: props.selected ? "white" : "none",
  border: props.selected ? "none" : "1px solid white",
  color: props.selected ? "black" : "white",
  cursor: "pointer",
  borderRadius: "0",
  fontSize: "1rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 10px",
}));

const ControlPanelToggleButton = styled("button")({
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "10px",
  borderRadius: "10px",
  fontSize: "1.5rem",
  width: "40px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  svg: {
    fill: "white",
    opacity: 0.15,
  },
  background: "none",
  border: "none",
  cursor: "pointer",
});
