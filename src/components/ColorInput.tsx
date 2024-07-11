import styled from "@emotion/styled";
import { slugify, titleCase } from "../helpers/string";

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = (props) => {
  const { id, label, value, onChange } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value);
  };
  return (
    <Container>
      <input
        id={`color_${slugify(label)}`}
        type="color"
        value={value}
        onChange={onChangeValue}
      />
      <label htmlFor={`color_${slugify(label)}`}>{titleCase(label)}</label>
    </Container>
  );
};

const Container = styled("div")({
  display: "flex",
  gap: "0.5rem",
});
