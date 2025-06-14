import { styled } from "@mui/material/styles";
import Header from "../components/Header";

const Container = styled("div")({
  minHeight: "100vh",
});

const ContentContainer = styled("div")({
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "80vh",
});

const WIPMessage = styled("div")({
  fontSize: "24px",
  fontWeight: "500",
  color: "#FFFFFF",
  textAlign: "center",
  marginBottom: "20px",
});

const SubMessage = styled("div")({
  fontSize: "16px",
  color: "#AAAAAA",
  textAlign: "center",
  maxWidth: "500px",
});

export default function InventoryReport() {
  return (
    <Container>
      <Header title="Inventory Report" />
      <ContentContainer>
        <WIPMessage>Work In Progress</WIPMessage>
        <SubMessage>
          The Inventory Report page is currently being redesigned from scratch.
          Check back soon for new features and improved functionality.
        </SubMessage>
      </ContentContainer>
    </Container>
  );
}
