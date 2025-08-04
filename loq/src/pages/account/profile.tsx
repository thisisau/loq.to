import { useEffect, useState } from "react";
import Button from "../../components/input/button";
import { FormItem, FormItemWithTitle } from "../../components/input/form";
import Layout from "../../components/page/layout";
import { useUserInfo } from "../../functions/userInfo";
import supabase from "../../supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/load";

export default function UserProfile() {
  const info = useUserInfo();
  const [session, setSession] =
    useState<Awaited<ReturnType<typeof supabase.auth.getSession>>>();
  useEffect(() => {
    supabase.auth.getSession().then(setSession);
  }, []);
  const navigate = useNavigate();

  if (session === undefined) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (session.data === null || session.data.session === null) {
    navigate("/");
    return null;
  }

  return (
    <Layout>
      <div style={{ width: "min(640px, calc(100% - 64px))" }}>
        <h1 style={{ textAlign: "center" }}>User Info</h1>
        <FormItem>Username: {info.username}</FormItem>
        <FormItem>
          Email: {session?.data?.session?.user.email ?? "Loading…"}
        </FormItem>
        <FormItemWithTitle title="Actions">
          <Button
            onClick={() =>
              supabase.auth
                .signOut({ scope: "local" })
                .then(() => navigate("/"))
            }
          >
            Sign Out (this device)
          </Button>
          <Button
            onClick={() =>
              supabase.auth
                .signOut({ scope: "global" })
                .then(() => navigate("/"))
            }
          >
            Sign Out (all devices)
          </Button>
          <Button
            onClick={() =>
              navigate(`/login?page=username&redirect=${encodeURIComponent(window.location.pathname)}`)
            }
          >
            Update Username
          </Button>
        </FormItemWithTitle>
      </div>
    </Layout>
  );
}
