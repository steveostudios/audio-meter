import styled from "@emotion/styled";

interface Props {
  children: React.ReactNode;
}

export const Row: React.FC<Props> = (props) => {
  const { children } = props;

  return <Container>{children}</Container>;
};

const Container = styled("div")({
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.5rem",
  height: "2rem",
});
