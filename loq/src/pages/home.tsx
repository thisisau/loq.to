import { useAddAlert } from "../components/alerts/alert_hooks";
import Layout from "../components/page/layout";
import { Modal } from "../components/page/modal";

export default function Home() {
  const addAlert = useAddAlert()
  return <Layout>
    Home page<button onClick={() => {
      addAlert(<Modal title="sdflk">Modal</Modal>)
    }}>sdfkl</button>
  </Layout>
}