import React, { useCallback, useEffect, useMemo, useRef } from "react";
import "./App.css";
import styled from "@emotion/styled";
import { Microphone } from "./helpers/microphone";
import { Number, Range, Text, Color, Label } from "./components/input";
import { Button } from "./components/Button";
import { Column, Row, Header } from "./components/layout";

interface Colors {
  [key: string]: string;
}

enum Mode {
  MIC = "mic",
  SETUP = "setup",
  STILL = "still",
}

const mic = new Microphone();

const App: React.FC = () => {
  const defaults = {
    colors: {
      background: "#1e1e1e",
      grid: "#000000",
      base: "#203662",
      mid: "#55a2a8",
      peak: "#c5203f",
    },
    opacity: 1,
    grid: {
      count: 24,
      width: 2,
      lock: false,
    },
    squish: [0, 0, 0, 0, 0, 0, 0, 0],
    freq: [1, 2, 3, 4, 6, 8, 10, 12],
    controlPanel: true,
    mode: Mode.MIC,
    isStarted: false,
  };

  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // state
  const [isStarted, setIsStarted] = React.useState(defaults.isStarted);
  const [mode, setMode] = React.useState<Mode>(defaults.mode);
  const [controlPanel, setControlPanel] = React.useState(defaults.controlPanel);
  const [freq, setFreq] = React.useState(defaults.freq);
  const stillValues = useMemo(
    () => [0.85, 0.68, 0.94, 0.74, 0.93, 0.86, 0.82, 0.65],
    []
  );

  const [colors, setColors] = React.useState<Colors>(defaults.colors);
  const [opacity, setOpacity] = React.useState(defaults.opacity);
  const [grid, setGrid] = React.useState(defaults.grid);
  const [squish, setSquish] = React.useState(defaults.squish);
  const [volume, setVolume] = React.useState(2);

  const onClearLocalStorage = () => {
    setColors(defaults.colors);
    setOpacity(defaults.opacity);
    setGrid(defaults.grid);
    setSquish(defaults.squish);
    setFreq(defaults.freq);
    setMode(defaults.mode);
    setIsStarted(defaults.isStarted);

    localStorage.clear();
  };

  // Load from local storage
  useEffect(() => {
    const colors = localStorage.getItem("colors");
    const opacity = localStorage.getItem("opacity");
    const grid = localStorage.getItem("grid");
    const squish = localStorage.getItem("squish");
    const freq = localStorage.getItem("freq");
    const mode = localStorage.getItem("mode");
    const isStarted = localStorage.getItem("isStarted");

    if (colors) setColors(JSON.parse(colors));
    if (opacity) setOpacity(JSON.parse(opacity));
    if (grid) setGrid(JSON.parse(grid));
    if (squish) setSquish(JSON.parse(squish));
    if (freq) setFreq(JSON.parse(freq));
    if (mode) setMode(JSON.parse(mode));
    if (isStarted) setIsStarted(JSON.parse(isStarted));
  }, []);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem("colors", JSON.stringify(colors));
    localStorage.setItem("opacity", JSON.stringify(opacity));
    localStorage.setItem("grid", JSON.stringify(grid));
    localStorage.setItem("squish", JSON.stringify(squish));
    localStorage.setItem("freq", JSON.stringify(freq));
    localStorage.setItem("mode", JSON.stringify(mode));
    localStorage.setItem("isStarted", JSON.stringify(isStarted));
  }, [colors, opacity, grid, squish, freq, mode, isStarted]);

  // Visualizer Loop
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
          mode === Mode.MIC
            ? micFreqs[f] - squish[i]
            : mode === Mode.STILL
            ? stillValues[i] - squish[i]
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
  }, [colors, freq, grid, mode, squish, isStarted, stillValues]);

  // change handlers
  const onToggleStart = () => {
    setIsStarted(!isStarted);
    saveToLocalStorage();
  };

  const onChangeMode = (value: Mode) => {
    setMode(value);
    saveToLocalStorage();
  };

  const onChangeColor = (id: string, value: string) => {
    setColors({ ...colors, [id]: value });
    saveToLocalStorage();
  };

  const onChangeFreq = (id: number, value: number) => {
    const newFreq = [...freq];
    newFreq[id] = value;
    setFreq(newFreq);
    saveToLocalStorage();
  };

  const onChangeSquish = (id: number, value: number) => {
    const newSquish = [...squish];
    newSquish[id] = value;
    setSquish(newSquish);
    saveToLocalStorage();
  };

  const onChangeGrid = (key: string, value: number) => {
    setGrid({ ...grid, [key]: value });
    saveToLocalStorage();
  };

  const onChangeOpacity = (value: number) => {
    setOpacity(value);
    saveToLocalStorage();
  };

  const onSetVolume = (value: number) => {
    setVolume(value);
    mic.setVolume(value);
    saveToLocalStorage();
  };

  return (
    <Container>
      <Background color={colors.background}>
        <CanvasWrapper op={opacity}>
          <Canvas ref={canvasRef} width="800" height="450"></Canvas>
        </CanvasWrapper>
        {controlPanel && (
          <ControlPanel>
            <Column>
              <Header label="General" />
              <Row>
                <Button
                  label="Mic"
                  onClick={() => onChangeMode(Mode.MIC)}
                  selected={mode === Mode.MIC}
                />
                <Button
                  label="Setup"
                  onClick={() => onChangeMode(Mode.SETUP)}
                  selected={mode === Mode.SETUP}
                />
                <Button
                  label="Still"
                  onClick={() => onChangeMode(Mode.STILL)}
                  selected={mode === Mode.STILL}
                />
              </Row>
              <Row>
                <Label htmlFor="volume" label="Volume" />
                <Range
                  label="volume"
                  value={volume}
                  onChange={onSetVolume}
                  step={0.1}
                  min={0}
                  max={20}
                />
              </Row>
              <Button
                label={isStarted ? "stop" : "start"}
                onClick={onToggleStart}
                selected={isStarted}
              />
              <Button
                onClick={onClearLocalStorage}
                selected={false}
                label="Reset to defaults"
              />
            </Column>
            <Column>
              <Header label="Frequencies" />
              {freq.map((f, i) => (
                <Row key={i}>
                  <Range
                    label={i.toString()}
                    value={f}
                    min={1}
                    max={16}
                    step={1}
                    onChange={(value) => onChangeFreq(i, value)}
                  />
                  <Text
                    id={i.toString()}
                    label={i.toString()}
                    value={
                      Math.round(f * (mic.sampleRate / mic.freqRange)) + " Hz"
                    }
                    readonly
                  />
                </Row>
              ))}
            </Column>
            <Column>
              <Header label="Squish" />
              {squish.map((s, i) => (
                <Row key={i}>
                  <Range
                    label={i.toString()}
                    value={s}
                    onChange={(value) => onChangeSquish(i, value)}
                  />
                  <Number
                    id={i.toString()}
                    label={i.toString()}
                    value={s}
                    readonly
                  />
                </Row>
              ))}
            </Column>
            <Column>
              <Header label="Colors" />
              {Object.keys(colors).map((key) => (
                <Row key={key}>
                  <Label htmlFor={key} label={key} />
                  <Color
                    id={key}
                    label={key}
                    value={colors[key]}
                    onChange={onChangeColor}
                  />
                </Row>
              ))}
              <Row>
                <Label htmlFor="opacity" label="Opacity" />
                <Range
                  label="opacity"
                  value={opacity}
                  onChange={onChangeOpacity}
                />
              </Row>
            </Column>
            <Column>
              <Header label="Grid" />
              <Row>
                <Number
                  id="count"
                  label="Grid Count"
                  value={grid.count}
                  onChange={(value) =>
                    onChangeGrid(
                      "count",
                      typeof value === "string" ? parseInt(value) : value || 0
                    )
                  }
                />
                <Label htmlFor="width" label="Grid Count" />
              </Row>
              <Row>
                <Number
                  id="width"
                  label="Grid Width"
                  value={grid.width}
                  onChange={(value) =>
                    onChangeGrid(
                      "width",
                      typeof value === "string" ? parseInt(value) : value || 0
                    )
                  }
                />
                <Label htmlFor="lock" label="Grid Width" />
              </Row>
              <Button
                onClick={() => setGrid({ ...grid, lock: !grid.lock })}
                selected={grid.lock}
                label={grid.lock ? "Locked to Grid" : "Lock to Grid"}
              />
              <Version>v1.0.0</Version>
            </Column>
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

const CanvasWrapper = styled("div")((props: { op: number }) => ({
  opacity: props.op,
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
  width: "calc(100% - 4rem)",
  gap: "2rem",
  display: "flex",
  flexDirection: "row",
  padding: "1rem",
  backgroundColor: "var(--color-controlpanel-bgo)",
  borderRadius: "1rem",
  margin: "1rem",
});

const ControlPanelToggleButton = styled("button")({
  position: "absolute",
  top: "1.5rem",
  right: "1.5rem",
  padding: "0",
  fontSize: "1rem",
  width: "1.5rem",
  height: "1.5rem",
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

const Version = styled("div")({
  position: "absolute",
  bottom: "1rem",
  right: "1rem",
  fontSize: "0.75rem",
  opacity: 0.5,
  color: "var(--color-label-text)",
});
