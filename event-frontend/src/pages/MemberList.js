import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';
import './MemberList.css';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [membersPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/members?page=${currentPage}&limit=${membersPerPage}`);
      
      if (response.data.success) {
        setMembers(response.data.data.members);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalMembers(response.data.data.pagination.totalMembers);
      } else {
        toast.error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, membersPerPage]);

  const filterMembers = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = members.filter(member => {
      // Universal search across all fields
      return (
        member.memberName?.toLowerCase().includes(term) ||
        member.fatherHusbandName?.toLowerCase().includes(term) ||
        member.daniMemberNo?.toLowerCase().includes(term) ||
        member.regNo?.toString().includes(term) ||
        member.contact?.mob1?.includes(term) ||
        member.contact?.mobNo2?.includes(term) ||
        member.contact?.emailId?.toLowerCase().includes(term) ||
        member.address?.city?.toLowerCase().includes(term) ||
        member.address?.state?.toLowerCase().includes(term) ||
        member.address?.country?.toLowerCase().includes(term) ||
        member.address?.pinCode?.includes(term) ||
        member.identification?.panNo?.toLowerCase().includes(term) ||
        member.identification?.aadharNo?.includes(term) ||
        member.personal?.occupation?.toLowerCase().includes(term) ||
        member.personal?.qualification?.toLowerCase().includes(term) ||
        member.spiritual?.dikshaPlace?.toLowerCase().includes(term) ||
        member.additional?.activity?.toLowerCase().includes(term) ||
        member.membership?.cardClass?.toLowerCase().includes(term)
      );
    });

    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // Check authentication
  useEffect(() => {
    // Authentication is now handled by HttpOnly cookies and API interceptor
    // No need to check localStorage token
  }, [navigate]);

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Filter members when search term changes (live search)
  useEffect(() => {
    filterMembers();
  }, [filterMembers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const handleMemberClick = (member) => {
    // Navigate to member profile using Dani Member Number
    navigate(`/member-profile/${member.daniMemberNo}`);
  };

  const handlePhoneClick = (phoneNumber, e) => {
    e.stopPropagation(); // Prevent triggering member click
    if (phoneNumber && phoneNumber !== 'N/A') {
      // Create a clickable phone link
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleSummaryClick = (member, e) => {
    e.stopPropagation();
    navigate(`/member-profile/${member.daniMemberNo}`);
  };

  const handleReceiptClick = (member, e) => {
    e.stopPropagation();
    navigate('/receipt-entry', { 
      state: { 
        selectedMember: member,
        prefillDaniMemberNo: member.daniMemberNo 
      } 
    });
  };

  const handleProfileClick = (member, e) => {
    e.stopPropagation();
    navigate('/member-entry', { 
      state: { 
        selectedMember: member,
        prefillDaniMemberNo: member.daniMemberNo 
      } 
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    );
  };

  return (
    <div className="member-list-container">
      {/* Simple Header Section */}
      <div className="page-header">
        <h1 className="page-title">Member Directory</h1>
        <p className="page-subtitle">Manage and explore your community members</p>
        <div className="header-stats">
          <span className="stat-item">{totalMembers} Total Members</span>
          <span className="stat-item">{filteredMembers.length} Active Results</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <h2 className="search-title">Find Members</h2>
          <div className="search-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by any field (name, phone, ID, city, etc.)..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                aria-label="Universal search across all member fields"
              />
              <button 
                type="button"
                className="search-icon-btn"
                disabled={!searchTerm.trim()}
                aria-label="Search icon"
                title="Live search - results update as you type"
              >
                🔍
              </button>
            </div>
            {searchTerm && (
              <button 
                className="clear-btn" 
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search and show all members"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{totalMembers}</span>
            <span className="stat-label">Total Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{filteredMembers.length}</span>
            <span className="stat-label">Search Results</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{currentPage}</span>
            <span className="stat-label">Current Page</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalPages}</span>
            <span className="stat-label">Total Pages</span>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">👥</div>
            <h3>No Members Found</h3>
            <p>
              {searchTerm 
                ? `No members match your search criteria "${searchTerm}"`
                : 'No members have been registered yet.'
              }
            </p>
            {!searchTerm && (
              <button 
                className="add-first-member-btn"
                onClick={() => navigate('/member-entry')}
              >
                Add First Member
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="members-header">
              <h2 className="members-title">
                Member Directory
                {searchTerm && (
                  <span className="search-indicator">
                    - Search Results ({filteredMembers.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="members-table-container">
              {filteredMembers.length === 0 && searchTerm ? (
                <div className="no-search-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No members found</h3>
                  <p>No members match your search criteria "{searchTerm}"</p>
                  <button className="clear-search-btn" onClick={clearSearch}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Dani Member No.</th>
                      <th>Father/Husband</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Occupation</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr 
                        key={member._id} 
                        className="member-table-row"
                        onClick={() => handleMemberClick(member)}
                      >
                        <td className="name-cell">
                          {member.memberName || 'Unknown Member'}
                        </td>
                        <td className="id-cell">
                          {member.regNo || 'N/A'}
                        </td>
                        <td className="dani-member-cell">
                          {member.daniMemberNo || 'N/A'}
                        </td>
                        <td className="father-cell">
                          {member.fatherHusbandName || 'N/A'}
                        </td>
                        <td className="phone-cell">
                          <span 
                            className={`phone-text ${member.contact?.mob1 && member.contact.mob1 !== 'N/A' ? 'clickable-phone' : ''}`}
                            onClick={(e) => handlePhoneClick(member.contact?.mob1, e)}
                            title={member.contact?.mob1 && member.contact.mob1 !== 'N/A' ? 'Click to call' : ''}
                          >
                            {member.contact?.mob1 || 'N/A'}
                          </span>
                        </td>
                        <td className="email-cell">
                          {member.contact?.emailId || 'N/A'}
                        </td>
                        <td className="city-cell">
                          {member.address?.city || 'N/A'}
                        </td>
                        <td className="state-cell">
                          {member.address?.state || 'N/A'}
                        </td>
                        <td className="occupation-cell">
                          {member.personal?.occupation || 'N/A'}
                        </td>
                        <td className="date-cell">
                          {formatDate(member.registrationDate)}
                        </td>
                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="member-actions">
                            <button 
                              className="action-btn summary-btn"
                              onClick={(e) => handleSummaryClick(member, e)}
                              title="View member summary"
                            >
                              Summary
                            </button>
                            <button 
                              className="action-btn receipt-btn"
                              onClick={(e) => handleReceiptClick(member, e)}
                              title="Create receipt for this member"
                            >
                              Receipt
                            </button>
                            <button 
                              className="action-btn profile-btn"
                              onClick={(e) => handleProfileClick(member, e)}
                              title="View/Edit member profile"
                            >
                              Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section">
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemberList;
