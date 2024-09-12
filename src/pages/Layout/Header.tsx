import styled from "styled-components";
import { ROUTE } from "@src/const/route.ts";

const StyledLayoutHeader = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  box-sizing: border-box;
  padding: 16px;
  border-bottom: 1px solid white;

  width: 100%;
`

const LayoutHeader = () => {
  return (
    <StyledLayoutHeader>
      <div>logo</div>
      <nav>
        <a href={ROUTE.HOME.path}>{ROUTE.HOME.title}</a>
      </nav>
    </StyledLayoutHeader>
  )
}

export default LayoutHeader
