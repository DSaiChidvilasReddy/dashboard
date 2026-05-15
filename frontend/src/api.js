const BASE_URL = "http://127.0.0.1:5000";

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const getMessages = async (userId) => {
  const res = await fetch(`${BASE_URL}/messages/${userId}`);
  return res.json();
};

export const sendMessage = async (payload) => {
  const res = await fetch(`${BASE_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res.json();
};

export const getLanguageSuggestions = async (query) => {
  const res = await fetch(
    `${BASE_URL}/language-suggestions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query
      })
    }
  );

  return res.json();
};

export const normalizeLanguage = async (language) => {
  const res = await fetch(
    `${BASE_URL}/normalize-language`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language
      })
    }
  );

  return res.json();
};

export const translateMessages = async (
  messages,
  language
) => {
  const res = await fetch(
    `${BASE_URL}/translate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages,
        language
      })
    }
  );

  return res.json();
};