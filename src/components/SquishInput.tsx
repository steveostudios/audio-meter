import styled from "@emotion/styled";

interface FreqInputProps {
  id: number;
  value: number;
  onChange: (id: number, value: number) => void;
}

export const SquishInput: React.FC<FreqInputProps> = (props) => {
  const { id, value, onChange } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, Number(e.target.value));
  };

  return (
    <Container>
      <input
        type="range"
        value={value}
        min={0}
        max={1}
        step={0.01}
        onChange={onChangeValue}
      />
      <input type="text" value={value} min={0} max={1} readOnly />
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
