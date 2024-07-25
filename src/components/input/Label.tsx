import styled from "@emotion/styled";
import { titleCase } from "./../../helpers/string";

interface Props {
  label: string;
  htmlFor: string;
}

export const Label: React.FC<Props> = (props) => {
  const { label, htmlFor } = props;

  return <Container htmlFor={htmlFor}>{titleCase(label)}</Container>;
};

const Container = styled("label")({
  fontSize: "14px",
  color: "var(--color-label)",
});
