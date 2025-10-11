import React from "react";
import { PackageCheck } from "lucide-react";

export default function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ marginTop: '2px' }}>
              <PackageCheck style={{ width: 20, height: 20, color: '#0369a1' }} />
            </div>
            <div>
              <div className="toast-title">{toast.title}</div>
              {toast.desc ? (
                <div className="toast-desc">{toast.desc}</div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
