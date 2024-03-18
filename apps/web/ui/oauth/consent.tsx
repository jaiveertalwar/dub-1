"use client";

import { authorizeRequest } from "@/lib/oauth";
import z from "@/lib/zod";
import { authRequestSchema } from "@/lib/zod/schemas/oauth";
import { Button, InputSelect, InputSelectItemProps } from "@dub/ui";
import { DICEBEAR_AVATAR_URL } from "@dub/utils";
import type { OAuthApp, Project } from "@prisma/client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

const initialState = {}

export function Consent({
  workspaces,
  app,
  requestParams,
}: {
  workspaces: Pick<Project, "id" | "name" | "logo">[];
  app: OAuthApp;
  requestParams: z.infer<typeof authRequestSchema>;
}) {
  const { pending } = useFormStatus();
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<InputSelectItemProps | null>(null);
  const [state, formAction] = useFormState<typeof initialState, FormData>(
    authorizeRequest,
    initialState,
  );

  return (
    <div>
      <h1>Authorize {app.name}</h1>
      <p>
        <strong>{app.name}</strong> is requesting API access to an workspace.
      </p>
      <form action={formAction}>
        <InputSelect
          items={workspaces.map((workspace) => ({
            id: workspace.id,
            value: workspace.name,
            image: workspace.logo || `${DICEBEAR_AVATAR_URL}${workspace.name}`,
          }))}
          selectedItem={selectedWorkspace}
          setSelectedItem={setSelectedWorkspace}
          inputAttrs={{
            placeholder: "Select a workspace",
          }}
        />
        <input type="hidden" name="workspaceId" value={selectedWorkspace?.id} />
        {Object.entries(requestParams).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <div className="flex">
          <Button text="Decline" loading={pending} />
          <Button
            disabled={workspaces.length === 0 || !selectedWorkspace}
            loading={pending}
            text="Authorize access"
          />
        </div>
      </form>
    </div>
  );
}

// TODO:
// When there is no workspaces available
// Select the first workspace by default
