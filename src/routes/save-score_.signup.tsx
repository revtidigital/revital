import { createFileRoute } from "@tanstack/react-router";
import { SaveScoreGate } from "@/components/SaveScoreGate";

export const Route = createFileRoute("/save-score_/signup")({
  component: () => <SaveScoreGate mode="signup" />,
});
