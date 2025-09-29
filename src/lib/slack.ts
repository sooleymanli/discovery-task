type SlackPayload = {
  text: string;
  blocks?: any[];
};

export async function postToSlack(payload: SlackPayload | string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    const body =
      typeof payload === 'string' ? { text: payload } : { text: payload.text, blocks: payload.blocks };
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Slack post error', err);
  }
}
