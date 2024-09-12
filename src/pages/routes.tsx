import { RouteObject } from "react-router-dom";
import App from "../App.tsx";
import Layout from "@src/pages/Layout";
import { ROUTE } from "@src/const/route.ts";

const routesObject: RouteObject[] = [
  {
    path: ROUTE.HOME.path,
    element: (
      <Layout>
        <App/>
      </Layout>
    ),
  }
]

export { routesObject }
