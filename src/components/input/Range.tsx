import styled from "@emotion/styled";
import { slugify } from "./../../helpers/string";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  selected?: boolean;
}

export const Range: React.FC<Props> = (props) => {
  const { label, disabled } = props;

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange && !disabled) props.onChange(parseFloat(e.target.value));
  };

  return (
    <Container
      type="range"
      id={`range_${slugify(label)}`}
      value={props.value}
      onChange={onChangeValue}
      disabled={disabled || false}
      min={props.min || 0}
      max={props.max || 1}
      step={props.step || 0.01}
      percent={
        (props.value - (props.min || 0)) / ((props.max || 1) - (props.min || 0))
      }
    />
  );
};

const Container = styled("input")(
  (props: { disabled: boolean; percent: number }) => ({
    display: "flex",
    gap: "0.5rem",
    opacity: props.disabled ? 0.5 : 1,
    cursor: props.disabled ? "not-allowed" : "pointer",
    borderRadius: "0.25rem",
    width: "100%",
    height: "2rem",
    fontWeight: "bold",
    background: `linear-gradient(to right, var(--color-secondary) ${
      props.percent * 100
    }%, var(--color-input-bg) ${props.percent * 100}%)`,
    "-webkit-appearance": "none" /* Override default look */,
    "::-webkit-slider-runnable-track": {
      accentColor: "var(--color-primary)",
      height: "2rem",
      borderRadius: "0.25rem",
    },
    "::-webkit-slider-thumb": {
      "-webkit-appearance": "none" /* Override default look */,
      backgroundColor: "var(--color-primary)",
      height: "2rem",
      borderRadius: "0.25rem",
      width: "2rem",
    },
  })
);
