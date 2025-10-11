import { useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  
  const push = (toast) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 2800);
  };

  const remove = (id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const clear = () => {
    setToasts([]);
  };

  return { toasts, push, remove, clear };
}
