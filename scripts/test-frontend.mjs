async function checkRoutes() {
  const routes = ["/", "/about", "/register", "/register/verify"];
  console.log("==================================================");
  console.log("MANGLAM MATRIMONY — FRONTEND ROUTE HEALTH CHECK");
  console.log("==================================================");

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    try {
      const res = await fetch(url);
      console.log(`Route [${route}] -> Status: ${res.status} ${res.statusText}`);
      if (res.status !== 200) {
        throw new Error(`Route ${route} failed with status ${res.status}`);
      }
    } catch (err) {
      console.error(`Route [${route}] failed to connect:`, err.message);
      process.exit(1);
    }
  }

  console.log("==================================================");
  console.log("ALL 4 FRONTEND ROUTES RETURNED 200 OK!");
  console.log("==================================================");
}

checkRoutes();
