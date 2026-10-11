import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Store, Image, Check } from 'lucide-react';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    available: true,
    availableSizes: []
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.availableSizes || [];
      if (sizes.includes(size)) {
        return { ...prev, availableSizes: sizes.filter(s => s !== size) };
      } else {
        return { ...prev, availableSizes: [...sizes, size] };
      }
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', stockQuantity: '', categoryId: '', available: true, availableSizes: []
    });
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
    setFormMessage(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('product', JSON.stringify({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      available: formData.available,
      availableSizes: formData.availableSizes.join(',')
    }));
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, data);
      } else {
        await api.post('/admin/products', data);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data ? (typeof error.response.data === 'string' ? error.response.data : error.response.data.message) : error.message;
      setFormMessage({ type: 'error', text: 'Error saving product: ' + errorMsg });
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id || '',
      available: product.available,
      availableSizes: product.availableSizes ? product.availableSizes.split(',') : []
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading products management...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Manage Products</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{products.length} products listed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Responsive Table Container */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Image</th>
                <th style={{ padding: '0.85rem 1rem' }}>Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                <th style={{ padding: '0.85rem 1rem' }}>Stock</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <img 
                      src={getProductImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      onError={handleImageError}
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} 
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {product.name}
                    {product.availableSizes && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sizes: {product.availableSizes}</div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    {product.category?.name || 'General'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                    ₹{product.price}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {product.stockQuantity}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      background: product.available ? '#dcfce7' : '#fee2e2',
                      color: product.available ? '#166534' : '#991b1b'
                    }}>
                      {product.available ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => handleEdit(product)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.5rem', minHeight: 'unset' }}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="btn btn-danger" 
                        style={{ padding: '0.35rem 0.5rem', minHeight: 'unset' }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-Friendly Add/Edit Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(3px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '520px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={22} color="#64748b" />
              </button>
            </div>
            
            {formMessage && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                marginBottom: '1rem', 
                borderRadius: '8px', 
                background: formMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
                color: formMessage.type === 'error' ? '#991b1b' : '#166534',
                fontSize: '0.875rem'
              }}>
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Cotton Printed Kurti"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="499"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    name="stockQuantity" 
                    value={formData.stockQuantity} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {/* Sizes Selector */}
              <div className="form-group">
                <label>Available Sizes</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        border: formData.availableSizes?.includes(size) ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: formData.availableSizes?.includes(size) ? '#eff6ff' : 'white',
                        color: formData.availableSizes?.includes(size) ? '#1d4ed8' : '#475569',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: formData.availableSizes?.includes(size) ? 700 : 500,
                        fontSize: '0.85rem'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={2} 
                  placeholder="Fabric, styling details, care instructions"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="available-check"
                  name="available" 
                  checked={formData.available} 
                  onChange={handleInputChange} 
                  style={{ width: 'auto' }}
                />
                <label htmlFor="available-check" style={{ margin: 0, cursor: 'pointer' }}>
                  Active & Available for Sale
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
