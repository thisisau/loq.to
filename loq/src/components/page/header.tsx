import { Link } from "react-router-dom";
import { useUserInfo } from "../../functions/userInfo";

export default function Header() {
  const userInfo = useUserInfo();

  return (
    <div className="main-header">
      <div>
        <Link to="/" draggable={false}>
          <img
            src="/assets/logos/loq/white.svg"
            alt="loq.to Logo"
            draggable={false}
          />
        </Link>
      </div>
      <div>
        {userInfo.id === "" ? (
          <Link to="/login">Log In</Link>
        ) : (
          <Link to="/account">{userInfo.displayName}</Link>
        )}
      </div>
    </div>
  );
}
