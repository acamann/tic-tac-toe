import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Authenticate = () => {
  return (
    <Container>
      <a href="/api/auth/login">Login</a>
    </Container>
  );
};

export default Authenticate;
