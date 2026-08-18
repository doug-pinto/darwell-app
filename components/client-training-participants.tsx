"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [editingId, setEditingId] = useState<string | null>(null);
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

  async function addParticipant() {
    if (
      !newParticipant.first_name.trim() ||
      !newParticipant.last_name.trim() ||
      !newParticipant.email.trim()
    ) {
      setError("Merci de renseigner le prénom, le nom et l'email.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("training_participants")
      .insert({
        training_session_id: trainingId,
        first_name: newParticipant.first_name.trim(),
        last_name: newParticipant.last_name.trim(),
        email: newParticipant.email.trim(),
      })
      .select("id, first_name, last_name, email")
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) => [...current, data]);

    setNewParticipant({
      first_name: "",
      last_name: "",
      email: "",
    });

    setIsAdding(false);
    setIsSaving(false);
  }

  function startEditing(participant: Participant) {
    setEditingId(participant.id);

    setEditParticipant({
      first_name: participant.first_name,
      last_name: participant.last_name,
      email: participant.email,
    });

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

  async function saveParticipant(id: string) {
    if (
      !editParticipant.first_name.trim() ||
      !editParticipant.last_name.trim() ||
      !editParticipant.email.trim()
    ) {
      setError("Merci de renseigner le prénom, le nom et l'email.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from("training_participants")
      .update({
        first_name: editParticipant.first_name.trim(),
        last_name: editParticipant.last_name.trim(),
        email: editParticipant.email.trim(),
      })
      .eq("id", id)
      .select("id, first_name, last_name, email")
      .single();

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? data : participant
      )
    );

    setEditingId(null);
    setIsSaving(false);
  }

  async function deleteParticipant(id: string) {
    const confirmed = window.confirm(
      "Supprimer ce participant de la formation ?"
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("training_participants")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setIsSaving(false);
      return;
    }

    setParticipants((current) =>
      current.filter((participant) => participant.id !== id)
    );

    setIsSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            Participants
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setError(null);
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Ajout d'un participant */}
      {isAdding && (
        <div className="rounded-xl border p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Prénom
              </label>

              <input
                value={newParticipant.first_name}
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    first_name: event.target.value,
                  })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Nom
              </label>

              <input
                value={newParticipant.last_name}
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    last_name: event.target.value,
                  })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Email
              </label>

              <input
                type="email"
                value={newParticipant.email}
                onChange={(event) =>
                  setNewParticipant({
                    ...newParticipant,
                    email: event.target.value,
                  })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
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
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>

            <button
              type="button"
              onClick={addParticipant}
              disabled={isSaving}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {participants.length === 0 && !isAdding ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun participant ajouté.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => {
            const isEditing = editingId === participant.id;

            return (
              <div
                key={participant.id}
                className="rounded-xl border p-4"
              >
                {isEditing ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Prénom
                        </label>

                        <input
                          value={editParticipant.first_name}
                          onChange={(event) =>
                            setEditParticipant({
                              ...editParticipant,
                              first_name: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Nom
                        </label>

                        <input
                          value={editParticipant.last_name}
                          onChange={(event) =>
                            setEditParticipant({
                              ...editParticipant,
                              last_name: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Email
                        </label>

                        <input
                          type="email"
                          value={editParticipant.email}
                          onChange={(event) =>
                            setEditParticipant({
                              ...editParticipant,
                              email: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          saveParticipant(participant.id)
                        }
                        disabled={isSaving}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {isSaving
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {participant.first_name}{" "}
                        {participant.last_name}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {participant.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(participant)
                        }
                        disabled={isSaving}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        aria-label="Modifier le participant"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteParticipant(participant.id)
                        }
                        disabled={isSaving}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                        aria-label="Supprimer le participant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}