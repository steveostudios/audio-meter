import styled from "@emotion/styled";
import { Microphone } from "../helpers/microphone";

interface FreqInputProps {
  id: number;
  value: number;
  onChange: (id: number, value: number) => void;
  min?: number;
  max?: number;
}

export const FreqInput: React.FC<FreqInputProps> = (props) => {
  const { id, value, onChange, min, max } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, Number(e.target.value));
  };
  const mic = new Microphone();

  return (
    <Container>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={onChangeValue}
      />
      <input
        type="text"
        value={Math.round(value * (mic.sampleRate / mic.freqRange)) + " hz"}
        min={min}
        max={max}
        readOnly
      />
    </Container>
  );
};

const Container = styled("div")({
  display: "flex",
  gap: "0.5rem",
  'input[type="text"]': {
    width: "50px",
  },
});
