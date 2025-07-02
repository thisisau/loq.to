import { Link } from "react-router-dom";
import Layout from "../../../components/page/layout";
import {
  PaginateContainer,
  usePaginate,
} from "../../../components/paginate/paginate";
import { DualColumn } from "../../../components/display/format";
import { useMutableState } from "../../../functions/hooks";
import { TextInput } from "../../../components/input/text";
import { useState } from "react";
import Button from "../../../components/input/button";
import { blurActiveElement, concatClasses } from "../../../functions/functions";
import { FullscreenLoader, Loader } from "../../../components/load";
import {
  useAddAlert,
  useAlertHandler,
} from "../../../components/alerts/alert_hooks";
import { LoaderModal, Modal } from "../../../components/page/modal";
import supabase from "../../../supabase/client";
import type { UUID } from "crypto";

type GamePages = {
  joinGame: null;
  playGame: {
    game: {
      roomID: UUID;
      roomCode: string;
      status: GameStatus;
    };
    user: {
      userName: string;
      userID: UUID;
      points: number;
    };
  };
};

type GameStatus =
  | {
      mode: "waiting";
    }
  | {
      mode: "pre-question";
    }
  | {
      mode: "answered-question";
    }
  | {
      mode: "post-question";
      leaderboard: GameLeaderboard;
    }
  | {
      mode: "question";
      question: GameQuestion;
    };

type GameLeaderboard = Array<{
  name: string;
  points: number;
}>;

type GameQuestion =
  | {
      type: "multiple-choice" | "multi-select" | "true-false" | "arrange";
      answerCount: number;
    }
  | {
      type: "open-ended";
    };

export default function Play() {
  return (
    <Layout className="live play" hideHeader>
      <PaginateContainer<GamePages, "joinGame">
        pages={{
          joinGame: <JoinGame />,
          playGame: <PlayGame />,
        }}
        defaultPage="joinGame"
        defaultState={null}
      />
    </Layout>
  );
}

function JoinGame() {
  const { setPage } = usePaginate<GamePages, "joinGame">();

  const [credentials, updateCredentials] = useMutableState({
    roomCode: "",
    username: "",
  });
  const [errorContent, setErrorContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  if (loading)
    return (
      <div className="join-game accent">
        <FullscreenLoader />
      </div>
    );

  return (
    <div className="join-game accent">
      <form className="join-form section" onSubmit={(e) => e.preventDefault()}>
        <img src="/assets/logos/loq/white.svg" draggable={false} />
        <TextInput
          placeholder="Room code"
          textAlign="center"
          maxLength={5}
          onUpdate={(e) => {
            updateCredentials((val) => (val.roomCode = e));
          }}
          defaultValue={credentials.roomCode}
        />
        <TextInput
          placeholder="Username"
          textAlign="center"
          maxLength={20}
          onUpdate={(e) => {
            updateCredentials((val) => (val.username = e));
          }}
          defaultValue={credentials.username}
        />
        <Button
          onClick={async () => {
            blurActiveElement();
            if (
              credentials.username.length === 0 ||
              credentials.roomCode.length !== 5
            ) {
              addAlert(
                <Modal title="Error">
                  Please enter a five-digit room code and a username.
                </Modal>
              );
              return;
            }

            const { id } = addAlert(<LoaderModal />);

            const { data: roomID, error: roomIDError } = await supabase.rpc(
              "live_get_room_id",
              {
                room_code: credentials.roomCode,
              }
            );

            if (roomIDError) {
              if (roomIDError.code === "90301")
                addAlert(
                  <Modal title="Error">
                    We couldn't find a room with code {credentials.roomCode}.
                  </Modal>
                );
              alertHandler.removeAlert(id);
              return;
            }

            const { data: userInfo, error: roomJoinError } = await supabase.rpc(
              "live_join_room",
              {
                display_name: credentials.username,
                room_id: roomID,
              }
            );

            if (roomJoinError) {
              addAlert(<Modal title="Error">{roomJoinError.message}</Modal>);
              alertHandler.removeAlert(id);
              return;
            }

            alertHandler.removeAlert(id);
            setPage("playGame", {
              user: {
                userName: (
                  userInfo as {
                    display_name: string;
                  }
                ).display_name,
                userID: (
                  userInfo as {
                    user_id: UUID;
                  }
                ).user_id,
                points: 0,
              },
              game: {
                roomID: roomID as UUID,
                roomCode: credentials.roomCode,
                status: {
                  mode: "waiting",
                },
              },
            });
          }}
          className={concatClasses(
            (credentials.username.length === 0 ||
              credentials.roomCode.length !== 5) &&
              "no-access"
          )}
          type="submit"
        >
          Join!
        </Button>
      </form>
      <div className="footer">
        <DualColumn
          left={
            <span>
              Powered by{" "}
              <Link to="/" target="_blank">
                loq.to
              </Link>
            </span>
          }
          right={<span>Join now for free!</span>}
        ></DualColumn>
      </div>
    </div>
  );
}

function PlayGame() {
  const { state, setPage, updateState } = usePaginate<GamePages, "playGame">();

  const gameContent = (() => {switch (state.game.status.mode) {
    case "waiting":
      return (
          <div>You're in!</div>
      );
  }})();

  return (
    <div className="play-game accent">
      <span>In game!</span>
      <span>{JSON.stringify(state)}</span>
    </div>
  );
}
