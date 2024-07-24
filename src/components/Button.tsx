import styled from "@emotion/styled";
import { slugify, titleCase } from "../helpers/string";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { label, onClick, disabled } = props;

  const onClickHandler = () => {
    if (onClick && !disabled) onClick();
  };
  return (
    <Container
      id={`color_${slugify(label)}`}
      onClick={onClickHandler}
      disabled={disabled || false}
      selected={props.selected || false}
    >
      {titleCase(label)}
    </Container>
  );
};

const Container = styled("button")(
  (props: { disabled: boolean; selected: boolean }) => ({
    display: "flex",
    gap: "0.5rem",
    opacity: props.disabled ? 0.5 : 1,
    cursor: props.disabled ? "not-allowed" : "pointer",
    borderRadius: "0.25rem",
    padding: "0.5rem 1rem",
    border: "2px solid var(--color-primary)",
    backgroundColor: props.selected ? "var(--color-primary)" : "transparent",
    color: props.selected
      ? "var(--color-controlpanel-bg)"
      : "var(--color-primary)",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  })
);
