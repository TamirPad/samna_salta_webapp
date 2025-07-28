import styled from "styled-components";

const NotFoundContainer = styled.div`
  padding: 2rem 0;
  text-align: center;
`;

const NotFoundPage: React.FC = () => {
  return (
    <NotFoundContainer>
      <div className="container">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
      </div>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
