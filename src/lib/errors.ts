import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";

export function handleApiError(error: unknown, fallbackMessage: string) {
  const { status, message } = mapErrorToStatus(error, fallbackMessage);
  
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

function mapErrorToStatus(error: unknown, fallbackMessage: string): { status: number; message: string } {
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Invalid JSON payload in request.",
    };
  }

  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => {
      const path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    });
    return {
      status: 400,
      message: `Invalid request payload: ${issues.join("; ")}`,
    };
  }

  if (error instanceof Error) {
    const msg = error.message;

    if (msg.includes("Platform not supported")) {
      return { status: 403, message: msg };
    }

    if (msg.includes("Refusing to write symlinked file")) {
      return {
        status: 403,
        message: "Security error: Symbolic links are not allowed in dotfile storage.",
      };
    }

    if (msg.includes("Invalid dotfile name")) {
      return { status: 400, message: msg };
    }

    if (msg.includes("EACCES") || msg.toLowerCase().includes("permission denied")) {
      return {
        status: 403,
        message: "Permission denied: Unable to access or modify local files.",
      };
    }

    if (msg.includes("Config file not found")) {
      return {
        status: 404,
        message: "Shell configuration file not found.",
      };
    }

    if (msg.includes("Config file is not writable")) {
      return {
        status: 403,
        message: "Shell configuration file is not writable. Check permissions.",
      };
    }

    if (msg.includes("is already installed") || msg.includes("is already sourced")) {
      return { status: 409, message: msg };
    }

    if (msg.includes("is not currently installed")) {
      return { status: 409, message: msg };
    }

    if (msg.includes("Invalid value for variable")) {
      return { status: 400, message: msg };
    }
    
    if (msg.includes("Dotfile not found")) {
      return { status: 404, message: msg };
    }
  }

  return {
    status: 500,
    message: fallbackMessage,
  };
}
