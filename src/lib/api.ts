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
      throw new Error(
        `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`
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
        `Malformed API response from ${url}: Response did not match expected envelope format.`
      );
    }

    const envelope = envelopeResult.data;

    if (envelope.success && envelope.data !== undefined) {
      const dataResult = schema.safeParse(envelope.data);
      if (!dataResult.success) {
        console.error(`Validation error for ${url}:`, dataResult.error);
        throw new Error(
          `API validation error: The server returned data in an unexpected format for ${url}.`
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
