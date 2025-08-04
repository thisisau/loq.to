import { Link } from "react-router-dom";
import Layout from "../components/page/layout";

export default function NotFound() {
  return (
    <Layout>
      <h1>404 Not Found</h1>
      <p>
        The page at {window.location.host + window.location.pathname} could not
        be found.
      </p>
      <p>
        <Link to="/">Back to home</Link>
      </p>
    </Layout>
  );
}
