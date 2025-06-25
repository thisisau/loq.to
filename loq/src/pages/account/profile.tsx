import Layout from "../../components/page/layout";
import { useUserInfo } from "../../functions/userInfo";

export default function UserProfile() {
  const info = useUserInfo();
  return <Layout>
    <div>Here's your user info:</div>
    <div>{JSON.stringify(info)}</div>
  </Layout>
}