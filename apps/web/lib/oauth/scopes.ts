export const scopesByResources = {
  workspace: [
    {
      scope: "read_workspace",
      description: "Read workspace",
    },
  ],
  links: [
    {
      scope: "write_links",
      description: "Create and update links",
    },
    {
      scope: "read_links",
      description: "Read links",
    },
    {
      scope: "delete_links",
      description: "Delete links",
    },
    {
      scope: "read_analytics",
      description: "Read links analytics",
    },
  ],
} as const;

export const scopes = Object.values(scopesByResources)
  .flat()
  .map((scope) => scope.scope);
