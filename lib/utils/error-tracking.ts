type ErrorContext = {
  userId?: string;
  orgId?: string;
  endpoint?: string;
  operation?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

type MessageContext = {
  userId?: string;
  orgId?: string;
  tags?: Record<string, string>;
};

type BreadcrumbContext = {
  category?: string;
  data?: Record<string, unknown>;
};

type SentryLike = {
  init?: (options: Record<string, unknown>) => void;
  captureException?: (error: Error, payload?: Record<string, unknown>) => void;
  captureMessage?: (
    message: string,
    levelOrPayload?: "info" | "warning" | "error" | Record<string, unknown>,
  ) => void;
  setUser?: (user: { id?: string; email?: string | null } | null) => void;
  setTag?: (key: string, value: string) => void;
  addBreadcrumb?: (crumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
    level?: "info" | "warning" | "error";
  }) => void;
};

function writeStdout(payload: unknown) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function getServerDsn() {
  return process.env.SENTRY_DSN || "";
}

function getClientDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || "";
}

let serverSdkPromise: Promise<SentryLike | null> | null = null;
let clientSdkPromise: Promise<SentryLike | null> | null = null;
let initialized = false;

async function loadServerSdk(): Promise<SentryLike | null> {
  if (serverSdkPromise) return serverSdkPromise;
  serverSdkPromise = (async () => {
    try {
      const pkg = "@sentry/node";
      const mod = (await import(pkg)) as unknown;
      if (typeof mod === "object" && mod !== null) {
        return mod as SentryLike;
      }
      return null;
    } catch {
      return null;
    }
  })();
  return serverSdkPromise;
}

async function loadClientSdk(): Promise<SentryLike | null> {
  if (clientSdkPromise) return clientSdkPromise;
  clientSdkPromise = (async () => {
    try {
      const pkg = "@sentry/react";
      const mod = (await import(pkg)) as unknown;
      if (typeof mod === "object" && mod !== null) {
        return mod as SentryLike;
      }
      return null;
    } catch {
      return null;
    }
  })();
  return clientSdkPromise;
}

async function loadSdk(): Promise<SentryLike | null> {
  if (typeof window === "undefined") {
    return loadServerSdk();
  }
  return loadClientSdk();
}

function withSentry(action: (sdk: SentryLike) => void) {
  void loadSdk().then((sdk) => {
    if (sdk) action(sdk);
  });
}

export function initializeErrorTracking() {
  if (initialized) return;
  initialized = true;

  const dsn = typeof window === "undefined" ? getServerDsn() : getClientDsn();
  if (!dsn) return;

  withSentry((sdk) => {
    sdk.init?.({
      dsn,
      environment: process.env.SENTRY_ENV || process.env.NODE_ENV || "production",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
  });
}

export function captureException(error: Error, context?: ErrorContext) {
  withSentry((sdk) => {
    sdk.captureException?.(error, {
      user: context?.userId ? { id: context.userId } : undefined,
      tags: {
        org_id: context?.orgId,
        endpoint: context?.endpoint,
        operation: context?.operation,
        ...context?.tags,
      },
      extra: context?.extra,
    });
  });

  console.error("Exception captured:", {
    message: error.message,
    stack: error.stack,
    context,
  });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: MessageContext,
) {
  withSentry((sdk) => {
    sdk.captureMessage?.(message, level);
  });

  if (level === "error" || level === "warning") {
    console.warn(`[${level.toUpperCase()}] ${message}`, context);
    return;
  }

  writeStdout({
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

export function setUserContext(userId: string, email?: string) {
  withSentry((sdk) => {
    sdk.setUser?.({ id: userId, email: email ?? null });
  });
}

export function setOrgContext(orgId: string) {
  withSentry((sdk) => {
    sdk.setTag?.("org_id", orgId);
  });
}

export function recordBreadcrumb(
  message: string,
  category: string = "user-action",
  data?: Record<string, unknown>,
) {
  const breadcrumb: BreadcrumbContext = { category, data };
  withSentry((sdk) => {
    sdk.addBreadcrumb?.({
      message,
      category: breadcrumb.category,
      data: breadcrumb.data,
      level: "info",
    });
  });

  writeStdout({
    level: "debug",
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function startTransaction(
  name: string,
  op: string = "http.request",
): { finish: () => void; setTag: (key: string, value: string) => void } {
  const startTime = Date.now();
  const tags: Record<string, string> = {};

  return {
    finish: () => {
      const duration = Date.now() - startTime;
      writeStdout({
        level: "debug",
        operation: op,
        name,
        duration,
        tags,
        timestamp: new Date().toISOString(),
      });
    },
    setTag: (key: string, value: string) => {
      tags[key] = value;
    },
  };
}

