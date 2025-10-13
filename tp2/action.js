window.onload = () => {
    const params = new URLSearchParams(document.location.search);
  
    for (const [key, value] of params.entries()) {
      const el = document.getElementById(key);
      if (!el) continue;
  
      const decoded = decodeURIComponent(value);
  
      if (key === "address") {
        el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decoded)}`;
        el.textContent = decoded;
      } else if (key === "email") {
        el.href = `mailto:${decoded}`;
        el.textContent = decoded;
      } else {
        el.textContent = decoded;
      }
    }
  };
  