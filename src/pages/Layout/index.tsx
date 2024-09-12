import styled from "styled-components";
import { ReactNode } from "react";

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  width: 100%;
  height: 100%;
`

type LayoutProps = {
  children: ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props

  return (
    <StyledLayout>
      <header>
        header
        <nav>nav</nav>
      </header>
      <aside>aside</aside>
      <main>{children}</main>
      <footer>footer</footer>
    </StyledLayout>
  )
}

export default Layout
