import styled from "styled-components";
import { ReactNode } from "react";
import LayoutHeader from "@src/pages/Layout/Header.tsx";

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
`

type LayoutProps = {
  children: ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props

  return (
    <StyledLayout>
      <LayoutHeader/>
      <aside>aside</aside>
      <main>{children}</main>
      <footer>footer</footer>
    </StyledLayout>
  )
}

export default Layout
