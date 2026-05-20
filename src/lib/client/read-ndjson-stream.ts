export async function readNdjsonStream<T>(
  response: Response,
  onEvent: (event: T) => void,
) {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Respons streaming tidak tersedia.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      onEvent(JSON.parse(trimmed) as T);
    }
  }

  buffer += decoder.decode();

  const lastLine = buffer.trim();
  if (lastLine) {
    onEvent(JSON.parse(lastLine) as T);
  }
}
