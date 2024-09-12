import styled from "styled-components";

const StyledLayoutAside = styled.aside`
  display: flex;
  position: absolute;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;
  padding: 16px;

  top: 200px; // header height
  left: 0;
  height: fit-content;
`

const LayoutAside = () => {
  return (
    <StyledLayoutAside>
      <input type="text"/>
    </StyledLayoutAside>
  )
}

export default LayoutAside
