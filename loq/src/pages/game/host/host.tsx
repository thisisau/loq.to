import { Suspense, useEffect } from "react";
import Layout from "../../../components/page/layout";
import { FullscreenLoader } from "../../../components/load";
import { useSuspenseLoggedInUserInfo } from "../../../functions/hooks";
import Button from "../../../components/input/button";
import supabase from "../../../supabase/client";
import { useAddNotification } from "../../../components/page/notification/hooks";
import Notification from "../../../components/page/notification/notification";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchLOQContents } from "../../../functions/database";
import { useNavigate, useParams } from "react-router-dom";
import {
  PaginateContainer,
  usePaginate,
} from "../../../components/paginate/paginate";
import { Contents } from "../../editor/editor.types";
import type { UUID } from "crypto";
import { LoaderModal, Modal } from "../../../components/page/modal";
import {
  useAddAlert,
  useAlertHandler,
} from "../../../components/alerts/alert_hooks";

type HostPages = {
  hostContent: null;
  hostGame: {
    loq: Contents;
    game: {
      roomID: UUID;
      roomCode: string;
      status: HostStatus;
    };
    users: Array<{
      userName: string;
      userID: UUID;
      points: number;
    }>;
  };
};

type HostStatus =
  | {
      mode: "waiting";
    }
  | {
      mode: "pre-game";
    }
  | {
      mode: "pre-question";
      question: number;
    }
  | {
      mode: "question" | "post-question" | "leaderboard";
      question: number;
      answers: Array<GameAnswer>;
    };

type GameAnswer =
  | {
      type: "multiple-choice" | "true-false";
      answer: number;
    }
  | {
      type: "arrange" | "multi-select";
      answer: Array<number>;
    }
  | {
      type: "open-ended";
      answer: string;
    };

export default function Host() {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <Layout className="live host" hideHeader>
        <PaginateContainer<HostPages, "hostContent">
          pages={{
            hostContent: <HostContent />,
            hostGame: <HostGame />,
          }}
          defaultPage="hostContent"
          defaultState={null}
        />
      </Layout>
    </Suspense>
  );
}

function HostContent() {
  const user = useSuspenseLoggedInUserInfo();
  const addNotification = useAddNotification();
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? null;
  const { setPage } = usePaginate<HostPages, "hostContent">();
  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  const { data: loq } = useSuspenseQuery({
    queryKey: ["public", "quizzes", "id", id, "contents", "host"],
    queryFn: () => fetchLOQContents(id ?? NaN),
  }).data;

  useEffect(() => {
    if (loq === null) {
      if (id !== null)
        addNotification(
          <Notification title="Error" time={4000}>
            A loq with ID {id} could not be found.
          </Notification>
        );
      navigate(`/view/${id}`);
    }
  }, []);
  if (loq === null) return null;

  return (
    <div className="host-game accent">
      <div className="game-preview section">
        <img src="/assets/logos/loq/white.svg" draggable={false} />
        <div className="title">{loq.settings.title}</div>
        <Button
          onClick={async () => {
            const { id } = addAlert(<LoaderModal />);

            const { data, error } = await supabase.rpc("live_create_room");

            if (error) {
              addAlert(<Modal title="Error">{error.message}</Modal>);
              alertHandler.removeAlert(id);
              return;
            }

            setPage("hostGame", {
              loq,
              game: {
                roomCode: (data as { code: string }).code,
                roomID: (data as { id: UUID }).id,
                status: {
                  mode: "waiting",
                },
              },
              users: [],
            });

            addNotification(
              <Notification title="Done!" time={4000}>
                Finished. Check browser console
              </Notification>
            );
            console.log({ data, error });
          }}
        >
          Play!
        </Button>
      </div>
    </div>
  );
}

function HostGame() {
  return null;
}
