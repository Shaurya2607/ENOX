const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("enox_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("enox_token", token);
  } else {
    localStorage.removeItem("enox_token");
  }
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export const api = {
  async get(path) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        ...authHeaders(),
      },
    });

    return handleResponse(response);
  },

  async post(path, body = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async patch(path, body = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },
};

/* =========================================================
   ENOX AI
   ========================================================= */

export async function askEnox(question) {
  if (!question || !question.trim()) {
    throw new Error("Please enter a question.");
  }

  return api.post("/debugging/ask", {
    question: question.trim(),
  });
}

export async function getEnoxContext() {
  return api.get("/debugging/context");
}

export async function queryEnoxProject(
  question,
  activeDocIds = []
) {
  if (!question || !question.trim()) {
    throw new Error("Please enter a question.");
  }

  return api.post("/ai/query", {
    question: question.trim(),
    activeDocIds,
  });
}

/* =========================================================
   SSE STREAM
   ========================================================= */

export function apiStream(path, onEvent) {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `${API_BASE}${path}`
    );

    let finished = false;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        onEvent?.(data);

        if (data.done) {
          finished = true;
          eventSource.close();
          resolve(data);
        }
      } catch (error) {
        eventSource.close();
        reject(error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();

      if (!finished) {
        reject(
          new Error("Stream connection failed.")
        );
      }
    };
  });
}