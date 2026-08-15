export type PreviewGateConfig = {
  mode?: string;
  password?: string;
};

function isPreviewMode(mode: string | undefined): boolean {
  return mode?.trim().toLowerCase() === "preview";
}

function unauthorizedResponse(): Response {
  return new Response("This site is currently in private preview.", {
    status: 401,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
      "www-authenticate": 'Basic realm="Bookmart private preview", charset="UTF-8"',
    },
  });
}

function unavailableResponse(): Response {
  return new Response("Private preview is not configured yet.", {
    status: 503,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function hasValidPreviewAuthorization(request: Request, password: string): boolean {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const credentials = atob(authorization.slice("Basic ".length));
    return credentials === `preview:${password}`;
  } catch {
    return false;
  }
}

/**
 * Protect every route until SITE_ACCESS_MODE is switched from preview to live.
 * The password is injected only by the host's secret manager and never reaches
 * the browser, source tree, or client bundle.
 */
export async function previewGate(
  request: Request,
  config: PreviewGateConfig,
): Promise<Response | null> {
  if (!isPreviewMode(config.mode)) return null;
  if (!config.password) return unavailableResponse();
  return hasValidPreviewAuthorization(request, config.password) ? null : unauthorizedResponse();
}

export function previewGateFromEnvironment(request: Request): Promise<Response | null> {
  return previewGate(request, {
    mode: process.env.SITE_ACCESS_MODE,
    password: process.env.SITE_PREVIEW_PASSWORD,
  });
}
