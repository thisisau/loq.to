import { Link } from "react-router-dom";
import { useAddAlert } from "../components/alerts/alert_hooks";
import Layout from "../components/page/layout";
import { Modal } from "../components/page/modal";
import { Card, DualColumn } from "../components/display/format";
import { useUserInfo } from "../functions/userInfo";

export default function Home() {
  const addAlert = useAddAlert();

  const userInfo = useUserInfo();

  return (
    <Layout className="home">
      <div className="header">
        <img src="/assets/logos/loq/white.svg" className="main-logo" />
        <h2 className="about-loq">
          The world's best platform to host live quiz sessions.
        </h2>
        <div className="transition" />
      </div>
      <div className="list" style={{ maxWidth: 800 }}>
        <Card title="Play LOQ!" link="/play">
          Play instantly with friends, family, classmates, or coworkers.
        </Card>
        {userInfo.loggedIn ? (
          <>
            <Card title="Create New" link="/editor">
              Create a new loq quiz.
            </Card>
            <Card title="Saved LOQs" link="/saved">
              View, edit, share, and play your loqs!
            </Card>
            <Card title="Account" link="/account">
              View and edit your user profile.
            </Card>
          </>
        ) : (
          <>
            <Card title="Sign Up" link="/login?page=signup">
              Create an account for free to access 100% of what loq.to has to
              offer!
            </Card>
            <Card title="Log In" link="/login">
              Have an account? Click here to log in.
            </Card>
            <Card title="Editor Demo" link="/editor">
              Not committed? Try our awesome editor without an account!
            </Card>
          </>
        )}

        <Card title="Explore loq.to" link="/explore">
          Check out loq's wide array of user-generated content!
        </Card>
      </div>
      <div className="home-footer">
        <DualColumn
          columns={[
            <Link to="/terms">Terms</Link>,
            <Link to="/privacy">Privacy</Link>,
            <Link
              to="."
              onClick={(e) => {
                e.preventDefault();
                addAlert(
                  <Modal title="Contact">
                    <span>
                      For inquiries and support, email
                      <br />
                      <a href="mailto:support@loq.to">
                        support&#8203;@&#8203;loq&#8203;.to
                      </a>
                      .
                    </span>
                  </Modal>
                );
              }}
            >
              Contact
            </Link>,
          ]}
        />
      </div>
    </Layout>
  );
}
