import { AnimatePresence, motion } from "motion/react";

import Layout from "../../components/page/layout";
import { ReactNode, useState } from "react";
import { TextInput } from "../../components/input/text";
import Button from "../../components/input/button";
import { Link } from "react-router-dom";
import { useMutableState } from "../../functions/hooks";
import { concatClasses, getRedirect } from "../../functions/functions";
import {
  attemptAuthentication,
  isValidEmail,
  isValidPassword,
} from "../../functions/authentication";
import {
  PaginateContainer,
  usePaginate,
} from "../../components/paginate/paginate";
import {
  useAddAlert,
  useAlertHandler,
} from "../../components/alerts/alert_hooks";
import { Modal } from "../../components/page/modal";
import supabase from "../../supabase/client";
import { errorCodeExists, errorCodes } from "../../supabase/error";

function isValidCredentials(credentials: { email: string; password: string }) {
  return (
    isValidEmail(credentials.email) && isValidPassword(credentials.password)
  );
}

function isValidCode(code: string) {
  return !isNaN(Number(code)) && code.length === 6;
}

export default function Login() {
  return (
    <Layout hideHeader>
      <div className="login-container section">
        <div className="login-container-header">
          <Link to="/">
            <img
              src="/assets/logos/loq/white.svg"
              alt="loq.to Logo"
              draggable={false}
            />
          </Link>
        </div>
        <div className="login-container-content">
          <GenericForm />
        </div>
      </div>
      <title>{`Log In - loq.to`}</title>
      <meta
        name="description"
        content={`Create or log in to your loq.to account.`}
      />
    </Layout>
  );
}

const LoginForm = () => {
  const { setPage } = usePaginate<LoginFormPages, "login">();
  const [credentials, updateCredentials] = useMutableState({
    email: "",
    password: "",
  });
  const [errorContent, setErrorContent] = useState<ReactNode>(null);

  return (
    <>
      <div className="login-title">Log In</div>
      <hr />
      <div className="login-form-content">
        <TextInput
          placeholder="Email Address"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.email = e))}
          maxLength={254}
          type="email"
        />
        <TextInput
          placeholder="Password"
          type="password"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.password = e))}
          maxLength={128}
        />
        <Button
          onClick={() => {
            attemptAuthentication("login", credentials, setErrorContent).then(
              (e) => {
                if (e.success)
                  window.location.href = getRedirect(window.location);
              }
            );
          }}
          id={"login-submit"}
          className={concatClasses(
            !isValidCredentials(credentials) && "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        <div>
          <Link
            to="."
            onClick={() => {
              setPage("forgotPassword", {
                email: credentials.email,
              });
            }}
          >
            Forgot your password?
          </Link>
        </div>
        <div>
          Don't have an account?{" "}
          <Link
            to="."
            onClick={() => {
              setPage("signup", undefined);
            }}
          >
            Sign up
          </Link>
          !
        </div>
        <div>
          <Link to={getRedirect(window.location)}>↜ Back</Link>
        </div>
      </div>
    </>
  );
};

const SignupForm = () => {
  const { setPage } = usePaginate<LoginFormPages, "signup">();
  const [credentials, updateCredentials] = useMutableState({
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errorContent, setErrorContent] = useState<ReactNode>(null);

  return (
    <>
      <div className="login-title">Sign Up</div>
      <hr />
      <div className="login-form-content">
        <TextInput
          placeholder="Email Address"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.email = e))}
          maxLength={254}
          type="email"
        />
        <TextInput
          placeholder="Password"
          type="password"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.password = e))}
          maxLength={128}
        />
        <TextInput
          placeholder="Confirm Password"
          type="password"
          textAlign="center"
          onUpdate={(e) =>
            updateCredentials((value) => (value.passwordConfirmation = e))
          }
          maxLength={128}
        />
        <Button
          onClick={() => {
            if (credentials.password !== credentials.passwordConfirmation) {
              setErrorContent("Your passwords do not match!");
              return;
            }
            attemptAuthentication("signup", credentials, setErrorContent).then(
              (e) => {
                if (e.success)
                  setPage("verifyEmail", {
                    email: credentials.email,
                  });
              }
            );
          }}
          id={"login-submit"}
          className={concatClasses(
            (!isValidCredentials(credentials) ||
              credentials.passwordConfirmation === "") &&
              "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        <div>
          Already have an account?{" "}
          <Link
            to="."
            onClick={() => {
              setPage("login", undefined);
            }}
          >
            Log in
          </Link>
          !
        </div>
        <div>
          <Link to={getRedirect(window.location)}>↜ Back</Link>
        </div>
      </div>
    </>
  );
};

const VerifyEmail = () => {
  const { state, setPage } = usePaginate<LoginFormPages, "verifyEmail">();
  const [credentials, updateCredentials] = useMutableState({
    verificationCode: "",
  });
  const [errorContent, setErrorContent] = useState<ReactNode>(null);
  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  const email = state.email;

  if (typeof email !== "string" || !isValidEmail(email)) {
    return (
      <>
        <div className="login-title">Verify Email</div>
        <hr />
        <div className="login-form-content">
          <div>
            An error occurred when trying to get an email address to send to.
          </div>
        </div>
        <div className="login-form-footer">
          <div>
            <Link
              to={`#`}
              onClick={(e) => {
                e.preventDefault();
                setPage("signup", undefined);
              }}
            >
              ↜ Back
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="login-title">Verify Email</div>
      <hr />
      <div className="login-form-content">
        <div className="center-text">
          Enter the six-digit verification code that was sent to{" "}
          {state.email || "your email"}.
        </div>
        <TextInput
          placeholder="Verification Code"
          textAlign="center"
          onUpdate={(e) =>
            updateCredentials((value) => (value.verificationCode = e))
          }
          maxLength={6}
          type="number"
        />
        <Button
          onClick={async () => {
            if (!isValidCode(credentials.verificationCode)) {
              setErrorContent("Your code must be a six-digit number.");
              return;
            }
            const { error } = await supabase.auth.verifyOtp({
              type: "email",
              token: credentials.verificationCode,
              email: state.email,
            });
            if (error) {
              switch (error.code) {
                case "otp_expired":
                  setErrorContent(
                    "Your verification code is invalid or has expired."
                  );
                  break;
                default:
                  setErrorContent(`An error occurred: ${error.message}`);
              }
              return;
            }
            setPage("accountInfo", {
              email,
            });
          }}
          id={"login-submit"}
          className={concatClasses(
            !isValidCode(credentials.verificationCode) && "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        {state.email && (
          <div className="login-form-text center-text">
            Didn't receive a code?&nbsp;
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                const {id} = addAlert(
                  <Modal title="Verification">
                    Sending a code to {state.email}…
                  </Modal>
                );
                const { error } = await supabase.auth.signInWithOtp({
                  email: state.email,
                }).catch(e => {console.log("ERRORRRR", e); return e})

                if (error === null)
                  alertHandler.replaceAlert(id, 
                    <Modal title="Verification">
                      A verification code has been sent to {state.email}!
                    </Modal>
                  );
                else
                  alertHandler.replaceAlert(id,
                    <Modal title="Verification">
                      An error occurred: {error.message}
                    </Modal>
                  );
              }}
            >
              Click here
            </a>
            &nbsp;to send another.
          </div>
        )}
      </div>
    </>
  );
};

const AccountInfo = () => {
  const { state } = usePaginate<LoginFormPages, "accountInfo">();
  const email: string | undefined =
    typeof state.email === "string" && isValidEmail(state.email)
      ? state.email
      : undefined;
  const defaultUsername = email ? email.split("@")[0].substring(0, 20) : "";
  const [credentials, updateCredentials] = useMutableState({
    username: defaultUsername,
  });
  const [errorContent, setErrorContent] = useState<ReactNode>(null);

  return (
    <>
      <div className="login-title">Choose Username</div>
      <hr />
      <div className="login-form-content">
        <div className="center-text">
          Your username will be publicly visible on your profile.
        </div>
        <TextInput
          placeholder="Add a username…"
          textAlign="center"
          defaultValue={credentials.username}
          onUpdate={(e) => updateCredentials((value) => (value.username = e))}
          maxLength={16}
          type="text"
        />
        <Button
          onClick={async () => {
            setErrorContent(null);
            if (
              /[^a-zA-Z0-9_\-\.]|^_|_$|[-_\.]{2}/.test(credentials.username) ||
              credentials.username.length < 3 ||
              credentials.username.length > 16
            ) {
              setErrorContent(
                "Your username must be between 3 and 16 characters long and only contain alphanumeric characters, periods, underscores, and hyphens. It can't start or end with an underscore or have two consecutive special characters."
              );
              return;
            }
            const { error } = await supabase.rpc("update_username", {
              new_username: credentials.username,
            });
            if (error) {
              setErrorContent(error.message);
              return;
            }
            window.location.href = getRedirect(window.location);
          }}
          id={"login-submit"}
          className={concatClasses(
            (credentials.username.length < 3 ||
              credentials.username.length > 16) &&
              "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        {/* {state.email && (
          <div className="login-form-text center-text">
            Didn't receive a code?&nbsp;
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                const alert = addAlert(
                  <Modal title="Verification">
                    Sending a code to {state.email}...
                  </Modal>
                );
                const { error } = await supabase.auth.signInWithOtp({
                  email: state.email,
                });
                if (error === null)
                  alertHandler.replaceAlert(
                    alert,
                    <Modal title="Verification">
                      A verification code has been sent to {state.email}!
                    </Modal>
                  );
                else
                  alertHandler.replaceAlert(
                    alert,
                    <Modal title="Verification">
                      An error occurred: {error.message}
                    </Modal>
                  );
              }}
            >
              Click here
            </a>
            &nbsp;to send another.
          </div>
        )} */}
      </div>
    </>
  );
};

const ForgotPassword = () => {
  const { state, setPage } = usePaginate<LoginFormPages, "forgotPassword">();

  const [credentials, updateCredentials] = useMutableState({
    email: state?.email ?? "",
  });
  const [errorContent, setErrorContent] = useState<ReactNode>(null);

  return (
    <>
      <div className="login-title">Reset Password</div>
      <hr />
      <div className="login-form-content">
        <div className="center-text">
          Enter your email below to send a password reset message.
        </div>
        <TextInput
          placeholder="Email Address"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.email = e))}
          maxLength={254}
          type="email"
        />
        <Button
          onClick={async () => {
            if (!isValidEmail(credentials.email)) {
              setErrorContent("Your email address is invalid.");
              return;
            }
            const { error } = await supabase.auth.resetPasswordForEmail(
              credentials.email
            );
            if (error) {
              setErrorContent(`An error occurred: ${error.message}`);
            } else {
              setPage("verifyForgotPassword", { email: credentials.email });
            }
          }}
          id={"login-submit"}
          className={concatClasses(
            !isValidEmail(credentials.email) && "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        <div>
          <Link
            to={"#"}
            onClick={(e) => {
              e.preventDefault();
              setPage("login", undefined);
            }}
          >
            ↜ Back
          </Link>
        </div>
      </div>
    </>
  );
};

const VerifyForgotPassword = () => {
  const { state, setPage } = usePaginate<
    LoginFormPages,
    "verifyForgotPassword"
  >();

  const [credentials, updateCredentials] = useMutableState({
    verificationCode: "",
  });

  const [errorContent, setErrorContent] = useState<ReactNode>(null);

  return (
    <>
      <div className="login-title">Reset Password</div>
      <hr />
      <div className="login-form-content">
        <div className="center-text">
          Enter the six-digit verification code that was sent to {state?.email}.
        </div>
        <TextInput
          placeholder="Verification Code"
          textAlign="center"
          onUpdate={(e) =>
            updateCredentials((value) => (value.verificationCode = e))
          }
          maxLength={6}
          type="number"
        />
        <Button
          onClick={async () => {
            if (!isValidCode(credentials.verificationCode)) {
              setErrorContent("Your code must be a six-digit number.");
              return;
            }
            const { error } = await supabase.auth.verifyOtp({
              type: "email",
              token: credentials.verificationCode,
              email: state.email,
            });
            if (error) {
              switch (error.code) {
                case "otp_expired":
                  setErrorContent(
                    "Your verification code is invalid or has expired."
                  );
                  break;
                default:
                  setErrorContent(`An error occurred: ${error.message}`);
              }
              return;
            }
            setPage("createNewPassword", state);
          }}
          id={"login-submit"}
          className={concatClasses(
            !isValidCode(credentials.verificationCode) && "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
      <div className="login-form-footer">
        <div>
          <Link
            to={"#"}
            onClick={(e) => {
              e.preventDefault();
              setPage("forgotPassword", state);
            }}
          >
            ↜ Back
          </Link>
        </div>
      </div>
    </>
  );
};

const CreateNewPassword = () => {
  const [errorContent, setErrorContent] = useState<ReactNode>(null);
  const [credentials, updateCredentials] = useMutableState({
    password: "",
    passwordConfirmation: "",
  });

  return (
    <>
      <div className="login-title">Update Password</div>
      <hr />
      <div className="login-form-content">
        <TextInput
          placeholder="Password"
          type="password"
          textAlign="center"
          onUpdate={(e) => updateCredentials((value) => (value.password = e))}
          maxLength={128}
        />
        <TextInput
          placeholder="Confirm Password"
          type="password"
          textAlign="center"
          onUpdate={(e) =>
            updateCredentials((value) => (value.passwordConfirmation = e))
          }
          maxLength={128}
        />
        <Button
          onClick={async () => {
            if (credentials.password !== credentials.passwordConfirmation) {
              setErrorContent("Your passwords do not match!");
              return;
            }
            const { error } = await supabase.auth.updateUser({
              password: credentials.password,
            });
            if (error === null) {
              window.location.href = `/account`;
              return;
            }
            setErrorContent(
              errorCodeExists(error.code)
                ? errorCodes[error.code!]
                : `An error with code ${error.code} occurred: ${error.message}`
            );
          }}
          id={"login-submit"}
          className={concatClasses(
            credentials.passwordConfirmation === "" && "no-access"
          )}
          type="submit"
        >
          Continue
        </Button>
        <span className="login-error">{errorContent}</span>
      </div>
    </>
  );
};

export type LoginFormPages = {
  signup: undefined;
  login: undefined;
  verifyEmail: { email: string };
  accountInfo: { email: string };
  forgotPassword: { email: string };
  verifyForgotPassword: { email: string };
  createNewPassword: { email: string };
};

function GenericForm() {
  return (
    <PaginateContainer<LoginFormPages, "login">
      pages={{
        signup: <SignupForm />,
        login: <LoginForm />,
        verifyEmail: <VerifyEmail />,
        accountInfo: <AccountInfo />,
        forgotPassword: <ForgotPassword />,
        verifyForgotPassword: <VerifyForgotPassword />,
        createNewPassword: <CreateNewPassword />,
      }}
      defaultPage={"login"}
      defaultState={undefined}
      // defaultState={{
      //   email: "thisisau49@gmail.com"
      // }}
      container={(Outlet, options) => (
        <AnimatePresence mode="wait">
          <motion.form
            className="login-form"
            key={`form-${options.currentPage}`}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            initial={{
              translateX: 100,
              opacity: 0,
            }}
            animate={{
              translateX: 0,
              opacity: 1,
              transition: {
                duration: 0.25,
                ease: "circOut",
              },
            }}
            exit={{
              translateX: -100,
              opacity: 0,
              transition: {
                duration: 0.25,
                ease: "circIn",
              },
            }}
          >
            <Outlet />
          </motion.form>
        </AnimatePresence>
      )}
    />
  );
}
