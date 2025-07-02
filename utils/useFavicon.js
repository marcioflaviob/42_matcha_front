import { useEffect } from "react";

const useFavicon = (url) => {
  useEffect(() => {
    const favicon = document.getElementById("favicon") || document.createElement("link");
    favicon.id = "favicon";
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = url;

    if (!document.head.contains(favicon)) {
      document.head.appendChild(favicon);
    }
  }, [url]);
};

export default useFavicon;
