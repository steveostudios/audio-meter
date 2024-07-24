import styled from "@emotion/styled";
import { titleCase } from "../helpers/string";

interface HeaderProps {
  label: string;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const { label } = props;

  return <Container>{titleCase(label)}</Container>;
};

const Container = styled("h3")({
  fontSize: "14px",
  color: "var(--color-label)",
  margin: "0",
  padding: "0",
  height: "2rem",
});
