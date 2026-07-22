/** Lê corpo de resposta de API com fallback amigável quando não for JSON. */
export async function readApiJson<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  if (!text) {
    if (!res.ok) {
      throw new Error(`Falha no servidor (${res.status}). Tente novamente.`);
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 80);
    if (/deploy|not found|vercel/i.test(snippet)) {
      throw new Error(
        "Ambiente indisponível. Abra o site em estetica-automotiva-crm.vercel.app e tente de novo.",
      );
    }
    throw new Error(
      res.ok
        ? "Resposta inválida do servidor. Tente novamente."
        : `Falha no servidor (${res.status}). Tente novamente.`,
    );
  }
}
