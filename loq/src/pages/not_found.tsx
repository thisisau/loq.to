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
        <a href="/">Back to home</a>
      </p>
    </Layout>
  );
}
