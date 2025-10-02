import { useState, useEffect } from 'react';
import axios from 'axios';

interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  price: string;
}

function CreatorDashboard() {
  const [content, setContent] = useState<Content[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    price: ''
  });
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get('/api/content');
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('price', formData.price);

    if (fullFile) {
      data.append('fullFile', fullFile);
    }
    if (previewFile) {
      data.append('previewFile', previewFile);
    }

    try {
      await axios.post('/api/content', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Content uploaded successfully!');
      setShowForm(false);
      setFormData({ title: '', description: '', type: 'VIDEO', price: '' });
      setFullFile(null);
      setPreviewFile(null);
      fetchContent();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div>
      <h1>Creator Dashboard</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="btn btn-primary"
        style={{ marginBottom: '20px' }}
      >
        {showForm ? 'Cancel' : 'Upload New Content'}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Upload Content</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Full File</label>
              <input
                type="file"
                onChange={(e) => setFullFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="form-group">
              <label>Preview File (Optional)</label>
              <input
                type="file"
                onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Upload
            </button>
          </form>
        </div>
      )}

      <h2>My Content</h2>
      <div className="grid">
        {content.map((item) => (
          <div key={item.id} className="card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Price:</strong> ${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreatorDashboard;
