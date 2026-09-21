import { createFileRoute, notFound } from "@tanstack/react-router";
import { SaveScoreGate } from "@/components/SaveScoreGate";

export const Route = createFileRoute("/save-score_/$mode")({
  beforeLoad: ({ params }) => {
    if (params.mode !== "login" && params.mode !== "signup") {
      throw notFound();
    }
  },
  component: SaveScoreModeRoute,
});

function SaveScoreModeRoute() {
  const { mode } = Route.useParams();
  return <SaveScoreGate mode={mode as "login" | "signup"} />;
}
