import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminMembers.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const API_URL = `${API_BASE_URL}/api/admin`;

function formatDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('twc_member_token');

      if (!token) {
        throw new Error('Please log in with an administrator account.');
      }

      const response = await fetch(`${API_URL}/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load members.');
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(err.message || 'Unable to load member accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const deleteMember = async () => {
    if (!memberToDelete) return;

    const memberId = memberToDelete.id;
    setDeletingId(memberId);
    setError('');
    setNotice('');

    try {
      const token = localStorage.getItem('twc_member_token');

      if (!token) {
        throw new Error('Please log in with an administrator account.');
      }

      const response = await fetch(
        `${API_URL}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete member.');
      }

      setMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );

      setNotice(data.message || 'Member account deleted successfully.');
      setMemberToDelete(null);
    } catch (err) {
      setError(err.message || 'Unable to delete this member.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      member.full_name,
      member.email,
      member.phone,
      String(member.id)
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });

  return (
    <main className="admin-members-page">
      <AdminNavbar />

      <div className="admin-members-container">
        <header className="admin-members-header">
          <div className="admin-members-heading">
            <span className="admin-members-eyebrow">
              THIKA WALKING CLUB
            </span>

            <h1>MEMBER MANAGEMENT</h1>

            <p>
              View and manage registered Thika Walking Club member accounts.
            </p>
          </div>

          <div className="admin-members-total">
            <Users size={25} />
            <div>
              <strong>{members.length}</strong>
              <span>REGISTERED MEMBERS</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="admin-members-alert error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="admin-members-alert success" role="status">
            <CheckCircle size={19} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="Dismiss notice"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="admin-members-toolbar">
          <div className="admin-members-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search by name, email, phone or member ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="admin-members-refresh"
            onClick={loadMembers}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? 'spinning' : ''} />
            REFRESH
          </button>
        </section>

        <section className="admin-members-list-section">
          <div className="admin-members-list-heading">
            <div>
              <h2>REGISTERED MEMBERS</h2>
              <p>
                Showing {filteredMembers.length} of {members.length} members
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-members-empty">
              <RefreshCw size={30} className="spinning" />
              <p>Loading member accounts...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="admin-members-empty">
              <Users size={42} />
              <h3>
                {search ? 'No matching members' : 'No registered members yet'}
              </h3>
              <p>
                {search
                  ? 'Try another search term.'
                  : 'New member registrations will appear here.'}
              </p>
            </div>
          ) : (
            <div className="admin-members-grid">
              {filteredMembers.map((member) => (
                <article className="admin-member-card" key={member.id}>
                  <div className="admin-member-card-top">
                    <div className="admin-member-avatar">
                      <Users size={23} />
                    </div>

                    <span className="admin-member-id">
                      MEMBER #{member.id}
                    </span>
                  </div>

                  <div className="admin-member-identity">
                    <h3>{member.full_name}</h3>
                    <span className="admin-member-role">
                      {member.role || 'member'}
                    </span>
                  </div>

                  <div className="admin-member-details">
                    <p>
                      <Mail size={16} />
                      <a href={`mailto:${member.email}`}>
                        {member.email}
                      </a>
                    </p>

                    <p>
                      <Phone size={16} />
                      <span>{member.phone || 'Not provided'}</span>
                    </p>

                    <p>
                      <CalendarDays size={16} />
                      <span>Joined {formatDate(member.created_at)}</span>
                    </p>
                  </div>

                  <div
                    className={`admin-member-status ${
                      member.is_active ? 'active' : 'inactive'
                    }`}
                  >
                    <span />
                    {member.is_active ? 'ACTIVE ACCOUNT' : 'INACTIVE ACCOUNT'}
                  </div>

                  <button
                    type="button"
                    className="admin-member-delete"
                    onClick={() => setMemberToDelete(member)}
                    disabled={deletingId === member.id}
                  >
                    <Trash2 size={17} />
                    DELETE MEMBER
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="admin-members-security-note">
          <ShieldCheck size={21} />
          <p>
            Deleting a member permanently removes their account. Existing event
            registrations, testimonials and merchandise order/payment records
            are retained without the member's personal account details.
          </p>
        </div>
      </div>

      {memberToDelete && (
        <div
          className="admin-member-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) {
              setMemberToDelete(null);
            }
          }}
        >
          <section
            className="admin-member-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-member-title"
          >
            <div className="admin-member-confirm-icon">
              <Trash2 size={27} />
            </div>

            <h2 id="delete-member-title">DELETE MEMBER ACCOUNT?</h2>

            <p>
              Are you sure you want to permanently delete
              {' '}
              <strong>{memberToDelete.full_name}</strong>
              {' '}?
            </p>

            <p className="admin-member-confirm-warning">
              This action cannot be undone. Their event registrations,
              testimonials and merchandise order/payment records will be
              retained, but detached from their account.
            </p>

            <div className="admin-member-confirm-actions">
              <button
                type="button"
                className="admin-member-cancel"
                onClick={() => setMemberToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="admin-member-confirm-delete"
                onClick={deleteMember}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    DELETING...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    YES, DELETE MEMBER
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminMembers;
