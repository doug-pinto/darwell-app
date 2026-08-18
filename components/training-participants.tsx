"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Participant = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
};

type TrainingParticipantsProps = {
  initialParticipants: Participant[];
};

export function TrainingParticipants({
  initialParticipants,
}: TrainingParticipantsProps) {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);

  function addParticipant() {
    setParticipants([
      ...participants,
      {
        first_name: "",
        last_name: "",
        email: "",
      },
    ]);
  }

  function removeParticipant(index: number) {
    setParticipants(
      participants.filter((_, participantIndex) => participantIndex !== index)
    );
  }

  function updateParticipant(
    index: number,
    field: "first_name" | "last_name" | "email",
    value: string
  ) {
    setParticipants(
      participants.map((participant, participantIndex) =>
        participantIndex === index
          ? {
              ...participant,
              [field]: value,
            }
          : participant
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Participants</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {participants.length} participant
            {participants.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={addParticipant}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun participant ajouté.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div
              key={participant.id ?? index}
              className="rounded-xl border p-4"
            >
              {participant.id && (
                <input
                  type="hidden"
                  name={`participants.${index}.id`}
                  value={participant.id}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Prénom
                  </label>

                  <input
                    name={`participants.${index}.first_name`}
                    value={participant.first_name}
                    onChange={(event) =>
                      updateParticipant(
                        index,
                        "first_name",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Nom
                  </label>

                  <input
                    name={`participants.${index}.last_name`}
                    value={participant.last_name}
                    onChange={(event) =>
                      updateParticipant(
                        index,
                        "last_name",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Email
                  </label>

                  <input
                    name={`participants.${index}.email`}
                    type="email"
                    value={participant.email}
                    onChange={(event) =>
                      updateParticipant(
                        index,
                        "email",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Supprimer le participant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="hidden"
        name="participants_count"
        value={participants.length}
      />
    </div>
  );
}