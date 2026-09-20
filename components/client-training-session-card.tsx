"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { ClientTrainingParticipants } from "@/components/client-training-participants";
import { Badge } from "@/components/ui/badge";

const MAX_PARTICIPANTS = 10;

type Participant = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type ClientTrainingSessionCardProps = {
  index: number;
  training: {
    id: string;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    status: string | null;
    description: string | null;
  };
  participants: Participant[];
  defaultOpen?: boolean;
};

export function ClientTrainingSessionCard({
  index,
  training,
  participants,
  defaultOpen = false,
}: ClientTrainingSessionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const participantCount = participants.length;
  const isCompleted = training.status === "completed";

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      {/* HEADER SESSION */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-6 p-6 text-left transition-colors hover:bg-muted/20"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600"
                : "bg-[#2814e8]/[0.07] text-[#2814e8]"
            }`}
          >
            {isCompleted ? (
              <span className="text-sm font-semibold">✓</span>
            ) : (
              <span className="text-sm font-semibold">
                {index + 1}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold">
                Journée {index + 1}
              </h2>

              <Badge
                className={
                  isCompleted
                    ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "border-0 bg-[#2814e8]/[0.07] text-[#2814e8] hover:bg-[#2814e8]/[0.07]"
                }
              >
                {isCompleted ? "Terminée" : "À venir"}
              </Badge>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(training.date)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />

                <span>
                  {formatTime(training.start_time, "09:30")}
                  {" – "}
                  {formatTime(training.end_time, "17:30")}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  {training.location || "Lieu à définir"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />

                <span>
                  {participantCount}{" "}
                  {participantCount > 1
                    ? "participants"
                    : "participant"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-sm font-medium text-[#2814e8] sm:block">
            {open ? "Masquer" : "Voir les détails"}
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* CONTENU DÉPLIÉ */}
      {open && (
        <div className="border-t px-6 py-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* INFORMATIONS */}
            <div>
              <p className="text-sm font-semibold">
                Informations
              </p>

              <div className="mt-5 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6">
                    {training.description ||
                      "Les informations détaillées de cette formation seront prochainement disponibles."}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Horaires
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-[#2814e8]" />

                    {formatTime(training.start_time, "09:30")}
                    {" – "}
                    {formatTime(training.end_time, "17:30")}
                  </div>

                  <p className="mt-1 pl-6 text-xs text-muted-foreground">
                    {getTrainingDuration(
                      training.start_time,
                      training.end_time
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Lieu
                  </p>

                  <div className="mt-2 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2814e8]" />

                    <p className="text-sm font-medium">
                      {training.location || "À définir"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PARTICIPANTS */}
            <div className="border-t pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    Participants
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {participantCount} / {MAX_PARTICIPANTS} participants
                  </p>
                </div>

                <Badge variant="secondary">
                  {participantCount}/{MAX_PARTICIPANTS}
                </Badge>
              </div>

              <div className="mt-5">
                <ClientTrainingParticipants
                  trainingId={training.id}
                  initialParticipants={participants}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) {
    return "Date à définir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(
  time: string | null,
  fallback: string
) {
  if (!time) {
    return fallback;
  }

  return time.slice(0, 5);
}

function getTrainingDuration(
  startTime: string | null,
  endTime: string | null
) {
  if (!startTime || !endTime) {
    return "Durée à définir";
  }

  const [startHours, startMinutes] = startTime
    .split(":")
    .map(Number);

  const [endHours, endMinutes] = endTime
    .split(":")
    .map(Number);

  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;

  const totalMinutes = end - start;

  if (totalMinutes <= 0) {
    return "Durée à définir";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h de formation`;
  }

  return `${hours}h${minutes
    .toString()
    .padStart(2, "0")} de formation`;
}