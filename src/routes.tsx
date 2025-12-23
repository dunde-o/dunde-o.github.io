import type { RouteRecord } from "vite-react-ssg";
import Layout from "./Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import posts from "./data/posts.json";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "blog/:slug",
        element: <BlogPost />,
        getStaticPaths: () => posts.map((post) => `/blog/${post.slug}`),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];
