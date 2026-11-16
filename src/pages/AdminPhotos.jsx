import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  Images,
  Eye,
  EyeOff,
  Replace
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminPhotos.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const PLACEMENTS = [
  { value: 'homepage', label: 'Homepage Carousel' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'activities', label: 'Activities' },
  { value: 'events', label: 'Events' },
  { value: 'partnerships', label: 'Partnerships' }
];

const emptyForm = {
  caption: '',
  description: '',
  placements: ['gallery'],
  is_published: true
};

function AdminPhotos() {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [replacingPhoto, setReplacingPhoto] = useState(null);

  const token = localStorage.getItem('twc_member_token');

  const requestHeaders = {
    Authorization: `Bearer ${token}`
  };

  const imageUrl = (photo) => {
    if (!photo?.url) return '';
    return photo.url.startsWith('http')
      ? photo.url
      : `${API_BASE_URL}${photo.url}`;
  };

  const loadPhotos = async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/photos/admin`,
        { headers: requestHeaders }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load photos.');
      }

      setPhotos(result.photos || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedFile(null);
    setPreview('');
    setEditingPhoto(null);
    setReplacingPhoto(null);

    const fileInput = document.getElementById('photo-file');
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('The image must not exceed 8 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePlacementChange = (value) => {
    setForm((previous) => ({
      ...previous,
      placements: previous.placements.includes(value)
        ? previous.placements.filter((item) => item !== value)
        : [...previous.placements, value]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingPhoto && !selectedFile) {
      setError('Please choose an image to upload.');
      return;
    }

    if (form.placements.length === 0) {
      setError('Select at least one website section.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      let response;
      let result;

      if (editingPhoto) {
        response = await fetch(
          `${API_BASE_URL}/api/photos/${editingPhoto.id}`,
          {
            method: 'PUT',
            headers: {
              ...requestHeaders,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              caption: form.caption,
              description: form.description,
              placements: form.placements,
              is_published: form.is_published
            })
          }
        );

        result = await response.json();
      } else {
        const data = new FormData();

        data.append('photo', selectedFile);
        data.append('caption', form.caption);
        data.append('description', form.description);
        data.append('placements', JSON.stringify(form.placements));
        data.append('is_published', String(form.is_published));

        response = await fetch(
          `${API_BASE_URL}/api/photos/`,
          {
            method: 'POST',
            headers: requestHeaders,
            body: data
          }
        );

        result = await response.json();
      }

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save photo.');
      }

      setMessage(
        editingPhoto
          ? 'Photo details updated successfully.'
          : 'Photo uploaded successfully.'
      );

      resetForm();
      await loadPhotos();
    } catch (err) {
      setError(err.message || 'Unable to save photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setReplacingPhoto(null);
    setSelectedFile(null);
    setPreview('');

    setForm({
      caption: photo.caption || '',
      description: photo.description || '',
      placements: photo.placements || [],
      is_published: photo.is_published
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplace = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('The image must not exceed 8 MB.');
      event.target.value = '';
      return;
    }

    const data = new FormData();
    data.append('photo', file);

    setReplacingPhoto(photoIdForReplace.current);

    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_BASE_URL}/api/photos/${photoIdForReplace.current}/replace`,
        {
          method: 'POST',
          headers: requestHeaders,
          body: data
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to replace image.');
      }

      setMessage('Image replaced successfully.');
      await loadPhotos();
    } catch (err) {
      setError(err.message || 'Unable to replace image.');
    } finally {
      setReplacingPhoto(null);
      event.target.value = '';
    }
  };

  const photoIdForReplace = { current: null };

  const startReplace = (photoId) => {
    photoIdForReplace.current = photoId;
    document.getElementById('replace-photo-file')?.click();
  };

  const handleDelete = async (photo) => {
    const confirmed = window.confirm(
      `Delete "${photo.original_filename}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/photos/${photo.id}`,
        {
          method: 'DELETE',
          headers: requestHeaders
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to delete photo.');
      }

      setMessage('Photo deleted successfully.');
      if (editingPhoto?.id === photo.id) resetForm();
      await loadPhotos();
    } catch (err) {
      setError(err.message || 'Unable to delete photo.');
    }
  };

  return (
    <main className="admin-photos-page">
      <header className="admin-photos-header">
        <button
          type="button"
          className="photos-back-button"
          onClick={() => navigate('/admin-dashboard')}
        >
          <ArrowLeft size={18} />
          ADMIN DASHBOARD
        </button>

        <div>
          <span>THIKA WALKING CLUB</span>
          <h1>PHOTO MANAGER</h1>
          <p>Manage the photographs displayed across your website.</p>
        </div>
      </header>

      <AdminNavbar />

      <div className="admin-photos-content">
        {error && (
          <div className="photos-alert error">{error}</div>
        )}

        {message && (
          <div className="photos-alert success">{message}</div>
        )}

        <section className="photo-form-card">
          <div className="photos-section-heading">
            <div>
              <span>WEBSITE MEDIA</span>
              <h2>{editingPhoto ? 'Edit Photo Details' : 'Upload New Photo'}</h2>
            </div>
            <ImagePlus size={32} />
          </div>

          <form onSubmit={handleSubmit} className="admin-photo-form">
            {!editingPhoto && (
              <label className="photo-upload-area">
                <Upload size={34} />
                <strong>Choose a photograph</strong>
                <span>JPG, PNG or WEBP · Maximum 8 MB</span>
                <input
                  id="photo-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                />
              </label>
            )}

            {preview && (
              <div className="photo-upload-preview">
                <img src={preview} alt="Selected upload preview" />
              </div>
            )}

            <label>
              Photo Caption
              <input
                value={form.caption}
                onChange={(event) => setForm({
                  ...form,
                  caption: event.target.value
                })}
                maxLength={200}
                placeholder="e.g. TWC Community Walk"
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({
                  ...form,
                  description: event.target.value
                })}
                rows={3}
                placeholder="Add a short description of this photograph..."
              />
            </label>

            <div className="photo-placement-group">
              <strong>Where should this photo appear?</strong>
              <p>You can select more than one section.</p>

              <div className="photo-placement-options">
                {PLACEMENTS.map((placement) => (
                  <label key={placement.value}>
                    <input
                      type="checkbox"
                      checked={form.placements.includes(placement.value)}
                      onChange={() => handlePlacementChange(placement.value)}
                    />
                    {placement.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="photo-publish-toggle">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => setForm({
                  ...form,
                  is_published: event.target.checked
                })}
              />
              Publish this photo on the website
            </label>

            <div className="photo-form-actions">
              <button
                type="submit"
                className="photo-save-button"
                disabled={saving}
              >
                <Upload size={18} />
                {saving
                  ? 'SAVING...'
                  : editingPhoto
                    ? 'SAVE PHOTO DETAILS'
                    : 'UPLOAD PHOTO'}
              </button>

              {editingPhoto && (
                <button
                  type="button"
                  className="photo-cancel-button"
                  onClick={resetForm}
                >
                  <X size={17} />
                  CANCEL
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-photo-library">
          <div className="photos-section-heading">
            <div>
              <span>YOUR WEBSITE COLLECTION</span>
              <h2>Photo Library ({photos.length})</h2>
            </div>

            <button
              type="button"
              className="photos-refresh-button"
              onClick={loadPhotos}
              disabled={loading}
            >
              <RefreshCw size={17} />
              REFRESH
            </button>
          </div>

          <input
            id="replace-photo-file"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleReplace}
            hidden
          />

          {loading ? (
            <p className="photos-empty">Loading your photo library...</p>
          ) : photos.length === 0 ? (
            <div className="photos-empty">
              <Images size={45} />
              <h3>No photos uploaded yet</h3>
              <p>Upload your first photograph using the form above.</p>
            </div>
          ) : (
            <div className="admin-photos-grid">
              {photos.map((photo) => (
                <article className="admin-photo-card" key={photo.id}>
                  <div className="admin-photo-image">
                    <img
                      src={imageUrl(photo)}
                      alt={photo.caption || photo.original_filename}
                    />

                    <span className={
                      photo.is_published
                        ? 'photo-status published'
                        : 'photo-status unpublished'
                    }>
                      {photo.is_published ? 'PUBLISHED' : 'HIDDEN'}
                    </span>
                  </div>

                  <div className="admin-photo-details">
                    <h3>{photo.caption || photo.original_filename}</h3>
                    <p>
                      {photo.description || 'No description added.'}
                    </p>

                    <div className="photo-placement-tags">
                      {(photo.placements || []).map((placement) => (
                        <span key={placement}>
                          {PLACEMENTS.find((item) => item.value === placement)?.label || placement}
                        </span>
                      ))}
                    </div>

                    <div className="photo-card-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(photo)}
                      >
                        <Pencil size={15} />
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() => startReplace(photo.id)}
                        disabled={replacingPhoto === photo.id}
                      >
                        <Replace size={15} />
                        {replacingPhoto === photo.id ? 'WAIT...' : 'REPLACE'}
                      </button>

                      <button
                        type="button"
                        className="photo-delete-button"
                        onClick={() => handleDelete(photo)}
                      >
                        <Trash2 size={15} />
                        DELETE
                      </button>
                    </div>

                    <div className="photo-card-footer">
                      {photo.is_published ? (
                        <><Eye size={15} /> Visible on selected sections</>
                      ) : (
                        <><EyeOff size={15} /> Hidden from visitors</>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminPhotos;
