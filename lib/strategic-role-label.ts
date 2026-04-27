export const STRATEGIC_ROLE_DESCRIPTION_KEYS: Record<string, string> = {
  "Trick Room Setter": "role.trickRoomSetter",
  "Trick Room Sweeper": "role.trickRoomSweeper",
  "Tailwind Setter": "role.tailwindSetter",
  "Rain Setter": "role.rainSetter",
  "Sun Setter": "role.sunSetter",
  "Sand Setter": "role.sandSetter",
  "Hazard Lead": "role.hazardLead",
  "Hazard Setter": "role.hazardSetter",
  "Hazard Control": "role.hazardControl",
  Pivot: "role.pivot",
  Support: "role.support",
  Wall: "role.wall",
  Tank: "role.tank",
  Sweeper: "role.sweeper",
};

export function getStrategicRoleLabel(
  role: string | undefined,
  t: (key: string) => string
): string | undefined {
  if (!role) return undefined;

  const translationKey = STRATEGIC_ROLE_DESCRIPTION_KEYS[role];
  if (!translationKey) return role;

  return t(translationKey);
}
