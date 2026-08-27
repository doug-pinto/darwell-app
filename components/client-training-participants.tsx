"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const MAX_PARTICIPANTS = 10;

type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type ClientTrainingParticipantsProps = {
  trainingId: string;
  initialParticipants: Participant[];
};

export function ClientTrainingParticipants({
  trainingId,
  initialParticipants,
}: ClientTrainingParticipantsProps) {
  const supabase = createClient();

  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newParticipant, setNewParticipant] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [editParticipant, setEditParticipant] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const participantCount = participants.length;

  const maxReached =
    participantCount >= MAX_PARTICIPANTS;

  const progress = useMemo(() => {
    return Math.min(
      (participantCount / MAX_PARTICIPANTS) * 100,
      100
    );
  }, [participantCount]);

  async function addParticipant() {
    if (maxReached) {
      setError(
        "Le nombre maximum de 10 participants est atteint."
      );
      return;
    }

    if (
      !newParticipant.first_name.trim() ||
      !newParticipant.last_name.trim() ||
      !newParticipant.email.trim()
    ) {
      setError(
        "Merci de renseigner le prénom, le nom et l'email."
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    const { count, error: countError } = await supabase
      .from("training_participants")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("training_session_id", trainingId);

    if (countError) {
      setError(countError.message);
      setIsSaving(false);
      return;
    }

    if ((count ?? 0) >= MAX_PARTICIPANTS) {
      setError(
        "Le nombre maximum de 10 participants est atteint."
      );
      setIsSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("training_participants")
      .insert({
        training_session_id: trainingId,
        first_name:
          newParticipant.first_name.trim(),
        last_name:
          newParticipant.last_name.trim(),
        email:
          newParticipant.email.trim(),
      })
      .select(
        "id, first_name, last_name, email"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) => [
      ...current,
      data,
    ]);

    setNewParticipant({
      first_name: "",
      last_name: "",
      email: "",
    });

    setIsAdding(false);
    setIsSaving(false);
  }

  function startEditing(
    participant: Participant
  ) {
    setEditingId(participant.id);

    setEditParticipant({
      first_name:
        participant.first_name,
      last_name:
        participant.last_name,
      email:
        participant.email,
    });

    setIsAdding(false);
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);

    setEditParticipant({
      first_name: "",
      last_name: "",
      email: "",
    });

    setError(null);
  }

  async function saveParticipant(
    id: string
  ) {
    if (
      !editParticipant.first_name.trim() ||
      !editParticipant.last_name.trim() ||
      !editParticipant.email.trim()
    ) {
      setError(
        "Merci de renseigner le prénom, le nom et l'email."
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data, error: updateError } =
      await supabase
        .from("training_participants")
        .update({
          first_name:
            editParticipant.first_name.trim(),
          last_name:
            editParticipant.last_name.trim(),
          email:
            editParticipant.email.trim(),
        })
        .eq("id", id)
        .eq(
          "training_session_id",
          trainingId
        )
        .select(
          "id, first_name, last_name, email"
        )
        .single();

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id
          ? data
          : participant
      )
    );

    setEditingId(null);

    setEditParticipant({
      first_name: "",
      last_name: "",
      email: "",
    });

    setIsSaving(false);
  }

  async function deleteParticipant(
    id: string
  ) {
    const confirmed = window.confirm(
      "Supprimer ce participant de la formation ?"
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: deleteError } =
      await supabase
        .from("training_participants")
        .delete()
        .eq("id", id)
        .eq(
          "training_session_id",
          trainingId
        );

    if (deleteError) {
      setError(deleteError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) =>
      current.filter(
        (participant) =>
          participant.id !== id
      )
    );

    if (editingId === id) {
      cancelEditing();
    }

    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-base font-semibold">
            Liste des participants
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {participantCount} /{" "}
            {MAX_PARTICIPANTS} participants
          </p>
        </div>

        {!isAdding && !maxReached && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setError(null);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-4 text-sm font-medium text-white transition hover:bg-[#2110c9]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un participant
          </button>
        )}
      </div>

      {/* PROGRESSION */}
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#2814e8] transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* INFO */}
      <div
        className={`rounded-xl border px-4 py-3 ${
          maxReached
            ? "border-amber-200 bg-amber-50"
            : "border-[#2814e8]/15 bg-[#2814e8]/[0.035]"
        }`}
      >
        <p
          className={`text-sm ${
            maxReached
              ? "text-amber-700"
              : "text-[#2814e8]"
          }`}
        >
          {maxReached
            ? "Le nombre maximum de 10 participants est atteint."
            : `Vous pouvez encore ajouter ${
                MAX_PARTICIPANTS -
                participantCount
              } participant${
                MAX_PARTICIPANTS -
                  participantCount >
                1
                  ? "s"
                  : ""
              }.`}
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* LISTE */}
      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
            <Users className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-semibold">
            Aucun participant ajouté
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Commencez par ajouter les personnes
            qui assisteront à cette formation.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          {/* TABLE HEADER */}
          <div className="hidden grid-cols-[1.2fr_1.4fr_120px] gap-4 border-b bg-muted/20 px-5 py-3 md:grid">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nom et prénom
            </p>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>

            <p className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </p>
          </div>

          <div className="divide-y">
            {participants.map(
              (participant) => {
                const isEditing =
                  editingId ===
                  participant.id;

                return (
                  <div
                    key={
                      participant.id
                    }
                    className="px-5 py-4"
                  >
                    {isEditing ? (
                      <div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Prénom
                            </label>

                            <input
                              value={
                                editParticipant.first_name
                              }
                              onChange={(
                                event
                              ) =>
                                setEditParticipant(
                                  {
                                    ...editParticipant,
                                    first_name:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Nom
                            </label>

                            <input
                              value={
                                editParticipant.last_name
                              }
                              onChange={(
                                event
                              ) =>
                                setEditParticipant(
                                  {
                                    ...editParticipant,
                                    last_name:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Email
                            </label>

                            <input
                              type="email"
                              value={
                                editParticipant.email
                              }
                              onChange={(
                                event
                              ) =>
                                setEditParticipant(
                                  {
                                    ...editParticipant,
                                    email:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={
                              cancelEditing
                            }
                            disabled={
                              isSaving
                            }
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-white px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              saveParticipant(
                                participant.id
                              )
                            }
                            disabled={
                              isSaving
                            }
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-3 text-sm font-medium text-white transition hover:bg-[#2110c9] disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />

                            {isSaving
                              ? "Enregistrement..."
                              : "Enregistrer"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid items-center gap-4 md:grid-cols-[1.2fr_1.4fr_120px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <p className="text-sm font-medium">
                            {
                              participant.first_name
                            }{" "}
                            {
                              participant.last_name
                            }
                          </p>
                        </div>

                        <p className="truncate text-sm text-muted-foreground">
                          {
                            participant.email
                          }
                        </p>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                participant
                              )
                            }
                            disabled={
                              isSaving
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                            aria-label="Modifier le participant"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteParticipant(
                                participant.id
                              )
                            }
                            disabled={
                              isSaving
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label="Supprimer le participant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* AJOUT */}
      {isAdding && !maxReached && (
        <div className="rounded-2xl border bg-muted/[0.12] p-5">
          <div>
            <p className="text-sm font-semibold">
              Ajouter un participant
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Renseignez les coordonnées du
              participant.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr_auto]">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prénom
              </label>

              <input
                value={
                  newParticipant.first_name
                }
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    first_name:
                      event.target.value,
                  })
                }
                placeholder="Ex. Marie"
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nom
              </label>

              <input
                value={
                  newParticipant.last_name
                }
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    last_name:
                      event.target.value,
                  })
                }
                placeholder="Ex. Dupont"
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={
                  newParticipant.email
                }
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    email:
                      event.target.value,
                  })
                }
                placeholder="Ex. marie@entreprise.com"
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);

                  setNewParticipant({
                    first_name: "",
                    last_name: "",
                    email: "",
                  });

                  setError(null);
                }}
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center rounded-xl border bg-white px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  addParticipant
                }
                disabled={
                  isSaving ||
                  maxReached
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-5 text-sm font-medium text-white transition hover:bg-[#2110c9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />

                {isSaving
                  ? "Ajout..."
                  : "Ajouter"}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Les informations sont utilisées
            uniquement pour la gestion de votre
            formation.
          </p>
        </div>
      )}
    </div>
  );
}