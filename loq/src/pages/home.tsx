import { Link, useNavigate } from "react-router-dom";
import { useAddAlert } from "../components/alerts/alert_hooks";
import Layout from "../components/page/layout";
import { Modal } from "../components/page/modal";

export default function Home() {
  const addAlert = useAddAlert();

  return <Layout>
    placeholder.to
    <br/>Links:
    <ul>
      <li><Link to="/login">Log in</Link></li>
      <li><Link to="/editor">loq editor</Link></li>
      <li><Link to="/saved">your loqs</Link></li>
      <li><Link to="/account">Account info</Link></li>
    </ul>
    <button onClick={() => {
      addAlert(<Modal title="sdflk">Modal</Modal>)
    }}>sdfkl</button>
  </Layout>
}