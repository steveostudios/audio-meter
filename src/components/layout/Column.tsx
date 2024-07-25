import styled from "@emotion/styled";

interface Props {
  children: React.ReactNode;
}

export const Column: React.FC<Props> = (props) => {
  const { children } = props;

  return <Container>{children}</Container>;
};

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: "0.5rem",
});
