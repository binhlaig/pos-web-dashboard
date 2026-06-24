

export async function POST(req: Request) {
  const form = await req.formData();

  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    body: form,
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
