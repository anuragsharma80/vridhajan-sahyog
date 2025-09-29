import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import './TopDonors.css';

const Reports = () => {
  const [allDonors, setAllDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    toDate: new Date().toISOString().split('T')[0] // Today
  });
  const [filters, setFilters] = useState({
    city: '',
    amountCondition: 'Greater Than',
    amountValue: '',
    amountValue2: '' // For "Between" option
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const amountConditions = [
    { value: 'Greater Than', symbol: '>' },
    { value: 'Less Than', symbol: '<' },
    { value: 'Equal To', symbol: '=' },
    { value: 'Greater Than or Equal To', symbol: '>=' },
    { value: 'Less Than or Equal To', symbol: '<=' },
    { value: 'Between', symbol: 'Between' }
  ];

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        limit: '1000' // Get more data for filtering
      });
      
      const response = await API.get(`/donors/top?${params}`);
      
      if (response.data.success) {
        setAllDonors(response.data.data.topDonors);
      } else {
        toast.error(response.data.message || 'Failed to fetch reports data');
        setAllDonors([]);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to fetch reports data. Please try again.');
      setAllDonors([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Check authentication
  useEffect(() => {
    // Authentication is now handled by HttpOnly cookies and API interceptor
    // No need to check localStorage token
  }, [navigate]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Auto-refresh every 30 seconds to catch new donations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReportsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchReportsData]);

  // Live filtering logic
  const applyFilters = useMemo(() => {
    let filtered = [...allDonors];

    // Filter by city
    if (filters.city.trim()) {
      filtered = filtered.filter(donor => 
        donor.city && donor.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by amount
    if (filters.amountValue && !isNaN(parseFloat(filters.amountValue))) {
      const amount = parseFloat(filters.amountValue);
      filtered = filtered.filter(donor => {
        const donorAmount = parseFloat(donor.totalAmount) || 0;
        switch (filters.amountCondition) {
          case 'Less Than':
            return donorAmount < amount;
          case 'Greater Than':
            return donorAmount > amount;
          case 'Equal To':
            return donorAmount === amount;
          case 'Greater Than or Equal To':
            return donorAmount >= amount;
          case 'Less Than or Equal To':
            return donorAmount <= amount;
          case 'Between':
            if (filters.amountValue2 && !isNaN(parseFloat(filters.amountValue2))) {
              const amount2 = parseFloat(filters.amountValue2);
              const minAmount = Math.min(amount, amount2);
              const maxAmount = Math.max(amount, amount2);
              return donorAmount >= minAmount && donorAmount <= maxAmount;
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allDonors, filters]);

  // Update filtered donors when filters change
  useEffect(() => {
    setFilteredDonors(applyFilters);
  }, [applyFilters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return filteredDonors.reduce((sum, donor) => sum + (parseFloat(donor.totalAmount) || 0), 0);
  };

  const getTopDonor = () => {
    return filteredDonors.length > 0 ? filteredDonors[0] : null;
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportToExcel = () => {
    if (filteredDonors.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = filteredDonors.map((donor, index) => ({
        'Rank': index + 1,
        'Donor Name': donor.memberName || '',
        'Amount': parseFloat(donor.totalAmount) || 0,
        'Date': donor.lastDonationDate ? formatDate(donor.lastDonationDate) : '',
        'City': donor.city || '',
        'State': donor.state || '',
        'Registration No': donor.regNo || '',
        'Dani Member No': donor.daniMemberNo || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 },   // Rank
        { wch: 25 },  // Donor Name
        { wch: 15 },  // Amount
        { wch: 20 },  // Date
        { wch: 20 },  // City
        { wch: 20 },  // State
        { wch: 15 },  // Registration No
        { wch: 18 }   // Dani Member No
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Donation Reports');

      // Generate filename with date range
      const fromDate = new Date(dateRange.fromDate).toLocaleDateString('en-IN');
      const toDate = new Date(dateRange.toDate).toLocaleDateString('en-IN');
      const filename = `Donation_Reports_${fromDate}_to_${toDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Excel file exported successfully: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel. Please try again.');
    }
  };

  return (
    <div className="top-donors-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Comprehensive donation reports with advanced filtering and export capabilities</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-controls">
          {/* Date Range Filter */}
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => handleDateRangeChange('fromDate', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* City Filter */}
          <div className="filter-group">
            <label>Filter by City:</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Enter city name..."
              className="filter-input"
            />
          </div>

          {/* Amount Filter */}
          <div className="filter-group">
            <label>Filter by Amount:</label>
            <div className="amount-filter-group">
              <select
                value={filters.amountCondition}
                onChange={(e) => handleFilterChange('amountCondition', e.target.value)}
                className="filter-select"
              >
                {amountConditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.symbol} {condition.value}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={filters.amountValue}
                onChange={(e) => handleFilterChange('amountValue', e.target.value)}
                placeholder="Enter amount..."
                className="filter-input"
                min="0"
                step="0.01"
              />
              {filters.amountCondition === 'Between' && (
                <input
                  type="number"
                  value={filters.amountValue2}
                  onChange={(e) => handleFilterChange('amountValue2', e.target.value)}
                  placeholder="Enter second amount..."
                  className="filter-input"
                  min="0"
                  step="0.01"
                />
              )}
            </div>
          </div>

          <div className="filter-group">
            <button 
              className="refresh-btn"
              onClick={fetchReportsData}
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          <div className="filter-group">
            <button 
              className="export-btn"
              onClick={exportToExcel}
              disabled={loading || filteredDonors.length === 0}
            >
              📊 Export to Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>{filteredDonors.length}</h3>
              <p>Filtered Donors</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>{formatCurrency(getTotalAmount())}</h3>
              <p>Total Amount</p>
            </div>
          </div>
          
          {getTopDonor() && (
            <div className="summary-card">
              <div className="card-icon">🏆</div>
              <div className="card-content">
                <h3>{getTopDonor().memberName}</h3>
                <p>Top Donor ({formatCurrency(getTopDonor().totalAmount)})</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="donors-table-container">
        <div className="table-header">
          <h2>
            Donation Reports - {new Date(dateRange.fromDate).toLocaleDateString('en-IN')} to {new Date(dateRange.toDate).toLocaleDateString('en-IN')}
            {filteredDonors.length !== allDonors.length && (
              <span className="filter-indicator"> (Filtered: {filteredDonors.length} of {allDonors.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : filteredDonors.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">📊</div>
            <h3>No data found</h3>
            <p>No donations found for the selected date range and filters.</p>
          </div>
        ) : (
          <div className="donors-table">
            <div className="table-header-row">
              <div className="col-rank">Rank</div>
              <div className="col-name">Donor Name</div>
              <div className="col-amount">Amount</div>
              <div className="col-date">Date</div>
              <div className="col-location">Location</div>
            </div>
            
            {filteredDonors.map((donor, index) => (
              <div key={donor.memberId || index} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                <div className="col-rank">
                  {index === 0 && <span className="rank-icon">🥇</span>}
                  {index === 1 && <span className="rank-icon">🥈</span>}
                  {index === 2 && <span className="rank-icon">🥉</span>}
                  {index > 2 && <span className="rank-number">{index + 1}</span>}
                </div>
                <div className="col-name">
                  <Link 
                    to={`/member-profile/${donor.daniMemberNo}`}
                    className="donor-name-link"
                  >
                    <div className="donor-name">{donor.memberName}</div>
                  </Link>
                </div>
                <div className="col-amount">
                  <div className="amount">{formatCurrency(donor.totalAmount)}</div>
                </div>
                <div className="col-date">
                  <div className="date">{formatDate(donor.lastDonationDate)}</div>
                </div>
                <div className="col-location">
                  <div className="location">{donor.city}, {donor.state}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
