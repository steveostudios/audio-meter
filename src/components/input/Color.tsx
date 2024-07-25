import styled from "@emotion/styled";
import { slugify } from "../../helpers/string";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

export const Color: React.FC<Props> = (props) => {
  const { id, label, value, onChange } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value);
  };
  return (
    <Container
      id={`color_${slugify(label)}`}
      type="color"
      value={value}
      onChange={onChangeValue}
    />
  );
};

const Container = styled("input")({
  "-webkit-appearance": "none",
  background: "none",
  cursor: "pointer",
  height: "2rem",
  border: "none",
  flex: 1,
  maxWidth: "8rem",
  borderRadius: "0.25rem",
  "::-webkit-color-swatch": {
    border: "1px solid var(--color-input-bg)",
    borderRadius: "0.25rem",
  },
  "::-webkit-color-swatch-wrapper": {
    padding: 0,
  },
});
