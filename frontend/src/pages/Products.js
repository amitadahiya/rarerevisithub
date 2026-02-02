import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    mood: '',
    sizes: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/products`, {
        ...formData,
        price: parseFloat(formData.price)
      });
      
      toast.success('Product added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', description: '', price: '', image_url: '', category: '', mood: '', sizes: [] });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-[#D4AF37]">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">Products</h1>
          <p className="text-white/50">Manage your fragrance catalogue</p>
        </div>
        <button
          data-testid="add-product-button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#D4AF37] text-black hover:bg-[#C5A059] font-medium rounded-sm px-6 py-3 transition-all duration-300 gold-glow flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#121212] border border-white/5 rounded-sm p-6 mb-8">
          <h2 className="text-2xl font-serif text-white mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              data-testid="product-name-input"
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white placeholder:text-white/20"
              required
            />
            <input
              data-testid="product-price-input"
              type="number"
              placeholder="Price (₹)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white placeholder:text-white/20"
              required
            />
            <input
              data-testid="product-image-input"
              type="url"
              placeholder="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white placeholder:text-white/20"
            />
            <select
              data-testid="product-mood-select"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm h-10 px-4 text-sm transition-all duration-300 text-white"
            >
              <option value="">Select Mood</option>
              <option value="sensual">Sensual</option>
              <option value="fresh">Fresh</option>
              <option value="woody">Woody</option>
              <option value="floral">Floral</option>
            </select>
            <textarea
              data-testid="product-description-input"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="md:col-span-2 bg-[#0A0A0A] border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-sm p-4 text-sm transition-all duration-300 text-white placeholder:text-white/20 resize-none"
              rows={3}
            />
            <button
              data-testid="submit-product-button"
              type="submit"
              className="md:col-span-2 bg-[#D4AF37] text-black hover:bg-[#C5A059] font-medium rounded-sm px-6 py-3 transition-all duration-300 gold-glow"
            >
              Add Product
            </button>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-[#121212] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-white/50">No products yet. Add your first product to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-[#121212] border border-white/5 rounded-sm p-6 hover:border-[#D4AF37]/20 transition-all duration-300" data-testid={`product-card-${product.id}`}>
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-sm mb-4" />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-serif text-white">{product.name}</h3>
                <button
                  data-testid={`delete-product-${product.id}`}
                  onClick={() => handleDelete(product.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {product.mood && (
                <span className="inline-block text-xs text-[#D4AF37] uppercase tracking-widest mb-2">{product.mood}</span>
              )}
              <p className="text-white/70 text-sm mb-3 line-clamp-2">{product.description}</p>
              <p className="text-2xl font-serif text-[#D4AF37]">₹{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;