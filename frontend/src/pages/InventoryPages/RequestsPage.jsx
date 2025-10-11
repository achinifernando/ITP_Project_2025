import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, CheckCircle2, Clock, X, AlertCircle, Mail, PackagePlus } from 'lucide-react';
import Modal from '../../components/Modal';
import { api } from '../../utils/apiPaths';
import '../../CSS/InventoryCSS/requestsPage.css';

export default function RequestsPage() {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ name: '', category: '', quantity: '', unit: 'pcs' }],
    newItems: [{ name: '', category: '', quantity: '', unit: 'pcs' }],
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      // Use your api utility consistently
      const [requestsData, suppliersData, inventoryData] = await Promise.all([
        api.get('/api/requests'),
        api.get('/api/suppliers'),
        api.get('/api/stocks')
      ]);
      
      setRequests(requestsData || []);
      setSuppliers(suppliersData || []);
      setInventory(inventoryData || []);
    } catch (e) {
      console.error('API Error:', e);
      setError('Failed to load data: ' + (e.message || 'Check console for details'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    if (suppliers.length === 0) {
      alert('Suppliers are still loading or none exist. Please add suppliers first.');
      return;
    }
    setEditingRequest(null);
    setFormData({
      supplier: '',
      items: [{ name: '', category: '', quantity: '', unit: 'pcs' }],
      newItems: [{ name: '', category: '', quantity: '', unit: 'pcs' }],
      notes: '',
      status: 'draft'
    });
    setShowModal(true);
  }

  function openEditModal(request) {
    // Prevent editing confirmed requests
    if (request.status === 'confirmed') {
      alert('Cannot edit confirmed requests');
      return;
    }
    
    setEditingRequest(request);
    setFormData({
      supplier: request.supplier?._id || request.supplier || '',
      items: request.items?.length > 0 ? request.items : [],
      newItems: [{ name: '', category: '', quantity: '', unit: 'pcs' }],
      notes: request.notes || '',
      status: request.status || 'draft'
    });
    setShowModal(true);
  }

  function addItem() {
    if (editingRequest) {
      setFormData(prev => ({
        ...prev,
        newItems: [...prev.newItems, { name: '', category: '', quantity: '', unit: 'pcs' }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { name: '', category: '', quantity: '', unit: 'pcs' }]
      }));
    }
  }

  function removeItem(index) {
    if (editingRequest) {
      setFormData(prev => ({
        ...prev,
        newItems: prev.newItems.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  }

  function updateItem(index, field, value, isNewItem = false) {
    setFormData(prev => {
      const itemsToUpdate = isNewItem ? prev.newItems : prev.items;
      const updatedItems = itemsToUpdate.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      
      // Auto-fill category and unit when name is selected
      if (field === 'name' && value) {
        const found = inventory.find(inv => inv.itemName === value);
        if (found) {
          updatedItems[index] = {
            ...updatedItems[index],
            category: found.category || '',
            unit: found.unit || 'pcs'
          };
        }
      }
      
      return { 
        ...prev, 
        [isNewItem ? 'newItems' : 'items']: updatedItems 
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!formData.supplier) {
      setError('Please select a supplier');
      return;
    }
    
    const itemsToValidate = editingRequest ? formData.newItems : formData.items;
    if (itemsToValidate.length === 0 || !itemsToValidate.some(item => item.name.trim())) {
      setError('Please add at least one item');
      return;
    }

    // Validate that all items have valid quantities
    const invalidItems = itemsToValidate.filter(item => 
      item.name.trim() && (!item.quantity || isNaN(item.quantity) || parseInt(item.quantity) < 1)
    );
    if (invalidItems.length > 0) {
      setError('Please enter valid quantities (minimum 1) for all items');
      return;
    }

    setLoading(true);
    try {
      let payload;
      
      if (editingRequest) {
        // When editing, combine existing items with new items
        const validNewItems = formData.newItems
          .filter(item => item.name.trim())
          .map(item => ({
            ...item,
            quantity: parseInt(item.quantity) || 1
          }));
        payload = {
          supplier: formData.supplier,
          items: [...formData.items, ...validNewItems],
          notes: formData.notes,
          status: formData.status
        };
      } else {
        // When creating, use items as usual
        payload = {
          supplier: formData.supplier,
          items: formData.items
            .filter(item => item.name.trim())
            .map(item => ({
              ...item,
              quantity: parseInt(item.quantity) || 1
            })),
          notes: formData.notes,
          status: formData.status
        };
      }

      let result;
      if (editingRequest) {
        result = await api.put(`/api/requests/${editingRequest._id}`, payload);
      } else {
        result = await api.post('/api/requests', payload);
      }

      setShowModal(false);
      setError('');
      await loadData(); // Reload data to stay in sync
    } catch (e) {
      setError(e.message || 'Failed to save request');
      console.error('Submit error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRequest(id) {
    // Find the request to check its status
    const request = requests.find(r => r._id === id);
    if (request && request.status === 'confirmed') {
      alert('Cannot delete confirmed requests');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/requests/${id}`);
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setLoading(true);
    try {
      await api.patch(`/api/requests/${id}/status`, { status });
      await loadData();
    } catch (e) {
      setError(e.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  function openEmailApp(supplierEmail, request) {
    if (!supplierEmail) {
      alert('No email address available for this supplier');
      return;
    }
    
    const subject = encodeURIComponent(`Request for Quotation`);
    const itemsList = request.items.map(i => 
      `${i.name} – ${i.quantity}${i.unit ? ' ' + i.unit : ''}`
    ).join('%0D%0A');
    
    const body = encodeURIComponent(
      `Dear ${request.supplier?.name || 'Supplier'},\n\nPlease provide a quotation for the following items:\n${itemsList}\n\nRegards,\nInventory Manager`
    );
    
    window.open(`mailto:${supplierEmail}?subject=${subject}&body=${body}`);
  }

  // Status badge component
  function StatusBadge({ status, isConfirmed = false }) {
    const statusConfig = {
      draft: { color: '#6b7280', bgColor: '#f3f4f6', label: 'Draft' },
      sent: { color: '#2563eb', bgColor: '#dbeafe', label: 'Sent' },
      confirmed: { color: '#d97706', bgColor: '#fef3c7', label: 'Confirmed' },
      received: { color: '#059669', bgColor: '#d1fae5', label: 'Received' },
      cancelled: { color: '#dc2626', bgColor: '#fee2e2', label: 'Cancelled' },
      closed: { color: '#7c3aed', bgColor: '#ede9fe', label: 'Closed' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`
      }}>
        {config.label}
      </span>
    );
  }

  if (loading && requests.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        color: '#6b7280'
      }}>
        Loading requests...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f9fafb',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Package style={{ color: '#2563eb', width: '24px', height: '24px' }} />
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a202c'
          }}>Supplier Requests</h1>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>New Request</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', marginRight: '8px' }} />
            <span style={{ color: '#b91c1c' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Requests Table */}
      {!Array.isArray(requests) || requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Package style={{ width: '48px', height: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1a202c', marginBottom: '8px' }}>
            No supplier requests
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Get started by creating your first supplier request.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Create Request
          </button>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                  Supplier
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                  Items
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                  Date
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} style={{
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a202c' }}>
                        {request.supplier?.name || 'Unknown Supplier'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {request.supplier?.company || ''}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#1a202c' }}>
                      {request.items?.length || 0} item(s)
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {request.items?.slice(0, 2).map(item => item.name).join(', ')}
                      {request.items?.length > 2 && '...'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {request.status === 'confirmed' ? (
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#10b981',
                          color: 'white',
                          display: 'inline-block',
                          cursor: 'not-allowed',
                          opacity: '0.8'
                        }}
                        title="Status confirmed - cannot be changed"
                      >
                        ✓ Confirmed
                      </span>
                    ) : (
                      <select
                        value={request.status}
                        onChange={(e) => updateStatus(request._id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '20px',
                          border: '1px solid #d1d5db',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                    {new Date(request.createdAt || request.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => openEditModal(request)}
                        disabled={request.status === 'confirmed'}
                        style={{ 
                          color: request.status === 'confirmed' ? '#9ca3af' : '#2563eb', 
                          background: 'none', 
                          border: 'none', 
                          cursor: request.status === 'confirmed' ? 'not-allowed' : 'pointer',
                          opacity: request.status === 'confirmed' ? 0.5 : 1
                        }}
                        title={request.status === 'confirmed' ? 'Cannot edit confirmed requests' : 'Edit'}
                      >
                        <Edit style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => deleteRequest(request._id)}
                        disabled={request.status === 'confirmed'}
                        style={{ 
                          color: request.status === 'confirmed' ? '#9ca3af' : '#dc2626', 
                          background: 'none', 
                          border: 'none', 
                          cursor: request.status === 'confirmed' ? 'not-allowed' : 'pointer',
                          opacity: request.status === 'confirmed' ? 0.5 : 1
                        }}
                        title={request.status === 'confirmed' ? 'Cannot delete confirmed requests' : 'Delete'}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => openEmailApp(request.supplier?.email, request)}
                        style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Send Email"
                      >
                        <Mail style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingRequest ? 'Edit Request' : 'New Supplier Request'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Form fields remain the same as your original */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Supplier
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px'
              }}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name} - {supplier.company}
                </option>
              ))}
            </select>
          </div>

          {/* Items section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {editingRequest ? 'Existing Items (Read-only)' : 'Items'}
              </label>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                {editingRequest ? 'Add New Item' : 'Add Item'}
              </button>
            </div>
            
            {/* Items section - editable when creating, read-only when editing */}
            {formData.items.map((item, index) => (
              <div key={`existing-${index}`} style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '8px', 
                alignItems: 'center',
                padding: '8px',
                backgroundColor: editingRequest ? '#f9fafb' : 'transparent',
                borderRadius: '8px',
                border: editingRequest ? '1px solid #e5e7eb' : 'none'
              }}>
                {editingRequest ? (
                  // Read-only inputs when editing
                  <>
                    <input
                      value={item.name}
                      readOnly
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                      placeholder="Item name"
                    />
                    
                    <input
                      value={item.category}
                      readOnly
                      style={{ 
                        width: '100px', 
                        padding: '8px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                      placeholder="Category"
                    />
                    
                    <input
                      value={item.quantity}
                      readOnly
                      style={{ 
                        width: '80px', 
                        padding: '8px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                      placeholder="Qty"
                    />
                    
                    <input
                      value={item.unit}
                      readOnly
                      style={{ 
                        width: '70px', 
                        padding: '8px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                      placeholder="Unit"
                    />
                  </>
                ) : (
                  // Editable inputs when creating new request
                  <>
                    <select
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value, false)}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      required
                    >
                      <option value="">Select item</option>
                      {inventory.map(inv => (
                        <option key={inv._id} value={inv.itemName}>{inv.itemName}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value, false)}
                      style={{ width: '100px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value, false)}
                      style={{ width: '80px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      min="1"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value, false)}
                      style={{ width: '70px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* New items section (only shown when editing) */}
            {editingRequest && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                  New Items
                </label>
                {formData.newItems.map((item, index) => (
                  <div key={`new-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value, true)}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      required
                    >
                      <option value="">Select item</option>
                      {inventory.map(inv => (
                        <option key={inv._id} value={inv.itemName}>{inv.itemName}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value, true)}
                      style={{ width: '100px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value, true)}
                      style={{ width: '80px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      min="1"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value, true)}
                      style={{ width: '70px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    
                    {formData.newItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                minHeight: '80px'
              }}
              placeholder="Additional notes or requirements..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px'
              }}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : editingRequest ? 'Update Request' : 'Create Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}