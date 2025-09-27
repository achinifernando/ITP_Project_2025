import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/apiPaths';
import Modal from '../../components/Modal';
import '../../CSS/InventoryCSS/suppliersPage.css';

import {
  Users,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  Search,
} from 'lucide-react';

// Helper to strip null/undefined/empty string before sending to backend
function clean(obj) {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') out[k] = v;
  });
  return out;
}

/* ---------------- Tiny Toasts (success / error messages) ---------------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (t) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
  };
  return { toasts, push };
}
function ToastStack({ toasts }) {
  return (
  <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 60 }}>
      {toasts.map((t) => {
        const ok = t.tone !== 'err';
        return (
          <div
            key={t.id}
            style={{ width: 320, borderRadius: 16, border: '1px solid', padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: ok ? '#fff' : '#fff', borderColor: ok ? '#a7f3d0' : '#fecaca', marginBottom: 8 }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
              {ok ? (
                <CheckCircle2 style={{ width: 20, height: 20, color: '#059669', marginTop: 2 }} />
              ) : (
                <XCircle style={{ width: 20, height: 20, color: '#e11d48', marginTop: 2 }} />
              )}
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.title}</div>
                {t.desc ? <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{t.desc}</div> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
/* ----------------------------------------------------------------------- */

export default function SuppliersPage() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  const { toasts, push } = useToasts();

  async function load() {
    setError('');
    try {
      setList(await api.get('/api/suppliers'));
    } catch (e) {
      setList([]);
      setError(e?.message || 'Failed to load suppliers');
      push({ title: 'Failed to load suppliers', desc: e?.message ?? 'Network error', tone: 'err' });
    }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEdit(null);
    setForm({ name:'', email:'', phone:'', company:'', status:'active' });
    setFieldErrors({});
    setOpen(true);
  }
  function openEdit(row) {
    setEdit(row);
    setForm({
      name: row.name, email: row.email, phone: row.phone, company: row.company, status: row.status,
      address: row.address, products: row.products || []
    });
    setFieldErrors({});
    setOpen(true);
  }

  // ---------- Validations ----------
  function validate() {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Name is required.';

    if (form.email?.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
      if (!emailOk) errs.email = 'Enter a valid email.';
    }

    if (form.phone?.trim()) {
      const digits = (form.phone + '').replace(/[^\d+]/g, '');
      if (digits.replace(/\D/g, '').length < 7) errs.phone = 'Enter a valid phone number.';
    }

    if (!form.status || !['active', 'inactive', 'pending'].includes(form.status)) {
      errs.status = 'Select a valid status.';
    }

    if (form.company && form.company.length > 80) {
      errs.company = 'Company name is too long (max 80).';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = clean(form);
      if (edit) {
        const updated = await api.put(`/api/suppliers/${edit._id}`, payload);
        setList(prev => prev.map(x => x._id === edit._id ? updated : x));
        push({ title: 'Supplier updated', desc: `"${updated.name}" saved successfully.` });
      } else {
        const created = await api.post('/api/suppliers', payload);
        setList(prev => [created, ...prev]);
        push({ title: 'Supplier added', desc: `"${created.name}" created successfully.` });
      }
      setOpen(false);
    } catch (e) {
      push({ title: 'Save failed', desc: e?.message ?? 'Request error', tone: 'err' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/api/suppliers/${id}`);
      setList(prev => prev.filter(x => x._id !== id));
      push({ title: 'Supplier deleted' });
    } catch (e) {
      push({ title: 'Delete failed', desc: e?.message ?? 'Request error', tone: 'err' });
    }
  }

  // ---------- Analysis ----------
  const analysis = useMemo(() => {
    const total = list.length;
    const byStatus = { active: 0, inactive: 0, pending: 0 };
    let missingEmail = 0;
    let missingPhone = 0;
    for (const s of list) {
      const st = (s.status || 'active').toLowerCase();
      if (byStatus[st] != null) byStatus[st]++;
      if (!s.email) missingEmail++;
      if (!s.phone) missingPhone++;
    }
    return { total, byStatus, missingEmail, missingPhone };
  }, [list]);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((i) =>
      (i.name || '').toLowerCase().includes(s) ||
      (i.company || '').toLowerCase().includes(s) ||
      (i.email || '').toLowerCase().includes(s) ||
      (i.phone || '').toLowerCase().includes(s)
    );
  }, [list, q]);

  return (
    <div className="suppliers-container" style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(to bottom, #e0f2fe, #fff, #e0f2fe)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 24 }}>
        {/* Analysis */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Suppliers</div>
              <div style={{ padding: 8, borderRadius: 8, background: '#e0f2fe', color: '#0369a1' }}><Users style={{ width: 16, height: 16 }} /></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: '#0f172a' }}>{analysis.total}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Active {analysis.byStatus.active ?? 0}</div>
          </div>

          <div style={{ borderRadius: 16, border: '1px solid #a7f3d0', background: '#d1fae5', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#065f46' }}>Active</div>
              <div style={{ padding: 8, borderRadius: 8, background: '#f0fdf4', color: '#059669' }}><CheckCircle2 style={{ width: 16, height: 16 }} /></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: '#065f46' }}>{analysis.byStatus.active ?? 0}</div>
            <div style={{ fontSize: 12, color: '#065f46', marginTop: 4 }}>Ready to request</div>
          </div>

          <div style={{ borderRadius: 16, border: '1px solid #fde68a', background: '#fef3c7', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#92400e' }}>Pending</div>
              <div style={{ padding: 8, borderRadius: 8, background: '#fffbe6', color: '#f59e42' }}><Pencil style={{ width: 16, height: 16 }} /></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: '#92400e' }}>{analysis.byStatus.pending ?? 0}</div>
            <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>Awaiting verification</div>
          </div>

          <div style={{ borderRadius: 16, border: '1px solid #fecaca', background: '#fee2e2', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#991b1b' }}>Inactive</div>
              <div style={{ padding: 8, borderRadius: 8, background: '#fff1f2', color: '#e11d48' }}><XCircle style={{ width: 16, height: 16 }} /></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: '#991b1b' }}>{analysis.byStatus.inactive ?? 0}</div>
            <div style={{ fontSize: 12, color: '#991b1b', marginTop: 4 }}>Re-enable if needed</div>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, borderRadius: 16, background: '#e0f2fe', color: '#0369a1' }}>
              <Building2 style={{ width: 20, height: 20 }} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c' }}>Suppliers</h1>
          </div>
          <button onClick={openCreate} className="suppliers-btn primary">
            Add Supplier
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16, position: 'relative', width: '100%', maxWidth: 384 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 16, height: 16 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, company, email, phone…"
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 16 }}
          />
        </div>

        {/* Table */}
        <div className="suppliers-table" style={{ overflowX: 'auto', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ minWidth: '100%', fontSize: 14 }}>
            <thead style={{ background: '#f1f5f9', color: '#64748b' }}>
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} style={{ borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                  <td style={{ padding: '12px 16px' }}>{s.name || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>{s.company || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Mail style={{ width: 14, height: 14, color: '#64748b' }} />
                      {s.email || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Phone style={{ width: 14, height: 14, color: '#64748b' }} />
                      {s.phone || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      className={`suppliers-status ${(s.status || 'active')}`}
                    >
                      {s.status || 'active'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="suppliers-actions">
                      <button onClick={() => openEdit(s)} className="suppliers-btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Pencil style={{ width: 16, height: 16 }} /> Edit
                      </button>
                      <button
                        onClick={() => remove(s._id)}
                        className="suppliers-btn" style={{ color: '#e11d48', background: '#fee2e2', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Trash2 style={{ width: 16, height: 16 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280' }} colSpan={6}>No suppliers.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ marginTop: 16, fontSize: 14, color: '#b91c1c', border: '1px solid #fecaca', background: '#fee2e2', borderRadius: 8, padding: '8px 12px' }}>
            {error}
          </div>
        )}

        {/* Modal */}
        <Modal open={open} title={edit ? 'Edit Supplier' : 'Add Supplier'} onClose={() => setOpen(false)} onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Name</span>
              <input
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', marginBottom: 4, ...(fieldErrors.name ? { borderColor: '#fecaca' } : {}) }}
                value={form.name || ''}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Supplier name"
              />
              {fieldErrors.name && <span style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{fieldErrors.name}</span>}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Company</span>
              <input
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', marginBottom: 4, ...(fieldErrors.company ? { borderColor: '#fecaca' } : {}) }}
                value={form.company || ''}
                onChange={e => setForm(f => ({...f, company: e.target.value}))}
                placeholder="Company (optional)"
              />
              {fieldErrors.company && <span style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{fieldErrors.company}</span>}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Email</span>
              <input
                type="email"
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', marginBottom: 4, ...(fieldErrors.email ? { borderColor: '#fecaca' } : {}) }}
                value={form.email || ''}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="name@example.com (optional)"
              />
              {fieldErrors.email && <span style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</span>}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Phone</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', marginBottom: 4, ...(fieldErrors.phone ? { borderColor: '#fecaca' } : {}) }}
                value={form.phone || ''}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "");
                  setForm(f => ({ ...f, phone: value }));
                  if (value && value.length !== 10) {
                    setFieldErrors(f => ({ ...f, phone: "Phone number must be 10 digits" }));
                  } else {
                    setFieldErrors(f => ({ ...f, phone: "" }));
                  }
                }}
                placeholder="07XXXXXXXX"
              />
              {fieldErrors.phone && (
                <span style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{fieldErrors.phone}</span>
              )}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Status</span>
              <select
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', marginBottom: 4, ...(fieldErrors.status ? { borderColor: '#fecaca' } : {}) }}
                value={form.status || 'active'}
                onChange={e => setForm(f => ({...f, status: e.target.value}))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="pending">pending</option>
              </select>
              {fieldErrors.status && <span style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{fieldErrors.status}</span>}
            </label>
          </div>

          {/* Visual disable on submit while saving */}
          <style>{`
            button[type="submit"] { ${saving ? 'opacity: 0.7; pointer-events: none;' : ''} }
          `}</style>
        </Modal>
      </div>

      {/* Toasts */}
      <ToastStack toasts={toasts} />
    </div>
  );
}
