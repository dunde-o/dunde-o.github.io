import { RouteObject } from "react-router-dom";
import App from "../App.tsx";
import Layout from "@src/pages/Layout";

const routesObject: RouteObject[] = [
  {
    path: '/',
    element: (
      <Layout>
        <App/>
      </Layout>
    ),
  }
]

export { routesObject }
