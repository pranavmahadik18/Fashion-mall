import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    
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
      // We can also show a success toast here if we wanted, but the modal closes.
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data ? (typeof error.response.data === 'string' ? error.response.data : error.response.data.message) : error.message;
      setFormMessage({ type: 'error', text: 'Error saving product: ' + errorMsg });
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

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Manage Products</h2>
        <button onClick={() => setShowModal(true)} className="btn"><Plus size={18} /> Add Product</button>
      </div>

      <div style={{ background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Sizes</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <img src={product.imageUrl ? `http://localhost:8081${product.imageUrl}` : 'https://via.placeholder.com/40'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>{product.name}</td>
                <td style={{ padding: '0.5rem 1rem' }}>{product.category?.name || '-'}</td>
                <td style={{ padding: '0.5rem 1rem' }}>₹{product.price}</td>
                <td style={{ padding: '0.5rem 1rem' }}>{product.stockQuantity}</td>
                <td style={{ padding: '0.5rem 1rem' }}>{product.availableSizes ? product.availableSizes : '-'}</td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <span style={{ color: product.available ? 'green' : 'red' }}>
                    {product.available ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(product)} className="btn" style={{ padding: '0.25rem 0.5rem', background: '#eab308' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(product.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            
            {formMessage && (
              <div style={{ 
                padding: '1rem', 
                marginBottom: '1rem', 
                borderRadius: '0.25rem', 
                background: formMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
                color: formMessage.type === 'error' ? '#991b1b' : '#166534'
              }}>
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock Quantity</label>
                  <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required min="0" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="block mb-2 font-medium">Available Sizes</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.25rem',
                        background: formData.availableSizes?.includes(size) ? '#ef4444' : 'white',
                        color: formData.availableSizes?.includes(size) ? 'white' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <small className="text-muted">Leave empty if you don't want to change the image.</small>
              </div>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} id="available" style={{ width: 'auto' }} />
                <label htmlFor="available" style={{ margin: 0 }}>Available for sale</label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={resetForm} className="btn" style={{ flex: 1, background: '#64748b' }}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
