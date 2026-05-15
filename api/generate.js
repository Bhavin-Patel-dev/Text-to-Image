export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { inputs } = req.body;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    },
  );

  // if HF returned an error
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const errorData = await response.json();
    return res.status(500).json({ error: errorData });
  }

  const buffer = await response.arrayBuffer();

  // Temporarily log what HF is returning
  const text = Buffer.from(buffer).toString("utf-8");
  console.log("HF Response:", text);

  res.setHeader("Content-Type", "image/jpeg");
  res.send(Buffer.from(buffer));
}
