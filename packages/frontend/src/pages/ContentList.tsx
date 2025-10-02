import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  price: string;
  previewFilePath?: string;
}

function ContentList() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchContent();
  }, [search]);

  const fetchContent = async () => {
    try {
      const response = await axios.get('/api/content', {
        params: { search }
      });
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Browse Content</h1>
      <div className="form-group">
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid">
        {content.map((item) => (
          <div key={item.id} className="card">
            {item.previewFilePath && (
              <img
                src={`/${item.previewFilePath}`}
                alt={item.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            )}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <Link to={`/content/${item.id}`}>
              <button className="btn btn-primary">View Details</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentList;
