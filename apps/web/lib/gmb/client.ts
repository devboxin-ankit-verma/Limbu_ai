type FetchOptions = RequestInit & { params?: Record<string, string> };

async function gmbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  let url = `/api${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type DashboardStats = {
  postsThisWeek: number;
  pendingReviews: number;
  viewsChange: string;
  callsChange: string;
  hasIntegration: boolean;
  recentReviews: Array<{
    id: string;
    rating: number;
    text: string | null;
    author: string | null;
    createdAt: string;
  }>;
  upcomingPosts: Array<{
    id: string;
    scheduledAt: string;
    preview: string;
  }>;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return gmbFetch("/dashboard/stats");
}

export type PostItem = {
  id: string;
  status: string;
  channels: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  content: { text?: string; title?: string };
  createdAt: string;
};

export async function fetchPosts(params?: { status?: string }) {
  return gmbFetch<{ posts: PostItem[] }>("/posts", { params });
}

export async function createPost(body: {
  content: { text?: string; keywords?: string; tone?: string };
  channels?: string[];
}) {
  return gmbFetch<{ post: PostItem }>("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function generatePostContent(postId: string, body: { keywords: string; tone?: string }) {
  return gmbFetch<{ post: PostItem }>(`/posts/${postId}/generate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function schedulePost(postId: string, scheduledAt: string) {
  return gmbFetch<{ post: PostItem }>(`/posts/${postId}/schedule`, {
    method: "POST",
    body: JSON.stringify({ scheduledAt }),
  });
}

export async function fetchCalendarPosts(from: string, to: string) {
  return gmbFetch<{ posts: PostItem[] }>("/posts/calendar", {
    params: { from, to },
  });
}

export type ReviewItem = {
  id: string;
  rating: number;
  text: string | null;
  author: string | null;
  repliedAt: string | null;
  createdAt: string;
  reply?: { content: string; status: string } | null;
};

export async function fetchReviews(params?: { filter?: string }) {
  return gmbFetch<{ reviews: ReviewItem[] }>("/reviews", { params });
}

export async function suggestReviewReply(reviewId: string) {
  return gmbFetch<{ suggestion: string }>(`/reviews/${reviewId}/suggest-reply`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function publishReviewReply(reviewId: string, content: string) {
  return gmbFetch<{ reply: { content: string; status: string } }>(`/reviews/${reviewId}/reply`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export type IntegrationItem = {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: string | null;
  locations: Array<{ id: string; name: string | null; address: string | null }>;
};

export async function fetchIntegrations() {
  return gmbFetch<{ connections: IntegrationItem[] }>("/integrations");
}

export async function connectGoogle() {
  return gmbFetch<{ url: string | null; mock?: boolean; connectionId?: string | null }>(
    "/integrations/google/connect",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export async function syncIntegration(connectionId: string) {
  return gmbFetch<{ syncRun: { id: string; status: string } }>(
    `/integrations/${connectionId}/sync`,
    { method: "POST", body: JSON.stringify({ type: "reviews" }) },
  );
}

export async function generateMagicQr(locationId: string) {
  return gmbFetch<{ qrDataUrl: string; funnelUrl: string }>("/magic-qr/generate", {
    method: "POST",
    body: JSON.stringify({ locationId }),
  });
}
