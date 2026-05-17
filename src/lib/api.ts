import { z } from "zod/v4";

/**
 * Standard options for the fetchApi utility.
 */
export interface FetchApiOptions extends RequestInit {
  timeout?: number;
}

/**
 * A robust fetch utility that handles:
 * - Timeouts via AbortController
 * - Content-Type validation
 * - Standard API envelope validation (success, data, error)
 * - Schema validation via Zod
 * - Network and timeout error mapping
 */
export async function fetchApi<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: FetchApiOptions
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(id);

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      const statusText = res.statusText || `Status ${res.status}`;
      throw new Error(
        `Server returned an unexpected response (${statusText}). This often happens if the server is down or encountered a critical error. Content: ${text.slice(0, 50).trim()}...`
      );
    }

    const json: unknown = await res.json();

    // Standard envelope schema for all API responses
    const envelopeSchema = z.object({
      success: z.boolean(),
      data: z.unknown().optional(),
      error: z.string().optional(),
    });

    const envelopeResult = envelopeSchema.safeParse(json);
    if (!envelopeResult.success) {
      throw new Error(
        `Malformed API response from ${url}: The server response did not match the expected format.`
      );
    }

    const envelope = envelopeResult.data;

    if (envelope.success) {
      if (envelope.data === undefined) {
         // Some successful requests might not return data, but our schema expects it.
         // If schema is z.void() or optional, we should handle it.
         // For now, we assume if success is true and schema is provided, we might need data.
         // But let's be flexible: if schema matches undefined, return it.
         const dataResult = schema.safeParse(undefined);
         if (dataResult.success) return dataResult.data;
         
         throw new Error(`API success but missing data payload from ${url}`);
      }

      const dataResult = schema.safeParse(envelope.data);
      if (!dataResult.success) {
        console.error(`Validation error for ${url}:`, dataResult.error);
        throw new Error(
          `API validation error: The server returned data in an unexpected format.`
        );
      }
      return dataResult.data;
    }

    throw new Error(envelope.error || `API request failed: ${url}`);
  } catch (err) {
    clearTimeout(id);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeout}ms: ${url}`);
      }
      if (err.message.includes("Failed to fetch")) {
        throw new Error(
          `Network error: Unable to reach the server. Please check if the development server is running.`
        );
      }
    }
    throw err;
  }
}
