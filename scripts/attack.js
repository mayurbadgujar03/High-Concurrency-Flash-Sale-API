async function attack() {
  const url = "http://localhost:8000/api/v1/shop/buy";

  const headers = {
    "x-user-id": "attacker_1",
    "Content-Type": "application/json",
  };
  const body = { productId: "64c9e654e599a81832123456" };

  console.log("Launching concurrency attack...");

  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(
      fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
    );
  }

  try {
    await Promise.all(requests);
    console.log("All requests sent.");
  } catch (error) {
    console.log(
      "Attack finished (some requests likely failed, which is good).",
    );
  }
}

attack();
