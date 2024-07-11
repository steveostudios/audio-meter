import styled from "@emotion/styled";
import { slugify, titleCase } from "../helpers/string";

interface ColorInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (id: string, value: number) => void;
}

export const NumberInput: React.FC<ColorInputProps> = (props) => {
  const { id, label, value, onChange } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, parseInt(e.target.value));
  };
  return (
    <Container>
      <input
        id={`number_${slugify(label)}`}
        type="number"
        value={value}
        onChange={onChangeValue}
      />
      <label htmlFor={`number_${slugify(label)}`}>{titleCase(label)}</label>
    </Container>
  );
};

const Container = styled("div")({
  display: "flex",
  gap: "0.5rem",
  input: {
    width: "50px",
  },
});
