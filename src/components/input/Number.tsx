import styled from "@emotion/styled";
import { slugify } from "./../../helpers/string";

interface Props {
  id: string;
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  disabled?: boolean;
}

export const Number: React.FC<Props> = (props) => {
  const { label, value, onChange, disabled } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) onChange(parseFloat(e.target.value));
  };
  return (
    <Container
      type="number"
      id={`number_${slugify(label)}`}
      value={value}
      onChange={onChangeValue}
      readOnly={props.readonly || false}
      disabled={disabled || false}
    />
  );
};

const Container = styled("input")(
  (props: { readOnly: boolean; disabled: boolean }) => ({
    display: "flex",
    width: "50px",
    backgroundColor: "var(--color-input-bg)",
    color: "var(--color-input-text)",
    padding: "0 0.5rem",
    height: "2rem",
    borderRadius: "0.25rem",
    border: "none",
    // "-webkit-user-select": "none",
    cursor: "default",
    // "user-select": "none",
    outline: "none",
  })
);
