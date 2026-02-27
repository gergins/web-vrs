export function translateSipInvite(invite: any) {
  return {
    type: "incoming-call",
    sessionId: invite.sessionId,
    caller: invite.from
  };
}
