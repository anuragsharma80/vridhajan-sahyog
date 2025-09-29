import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import './MemberProfile.css';

const MemberProfile = () => {
  const { daniMemberNo } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalDonations: 0,
    averageDonation: 0,
    totalReceipts: 0,
    firstDonationDate: null,
    lastDonationDate: null
  });
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchMemberProfile = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) {
        params.append('year', selectedYear.toString());
      }

      const response = await API.get(`/donors/dani/${daniMemberNo}?${params}`);
      
      if (response.data.success) {
        setMember(response.data.data.member);
        setReceipts(response.data.data.receipts);
        setStatistics(response.data.data.statistics);
        setMonthlyDonations(response.data.data.monthlyDonations);
      } else {
        toast.error(response.data.message || 'Failed to fetch member profile');
        navigate('/member-list');
      }
    } catch (error) {
      console.error('Error fetching member profile:', error);
      toast.error('Failed to fetch member profile. Please try again.');
      navigate('/member-list');
    } finally {
      setLoading(false);
    }
  }, [daniMemberNo, selectedYear, navigate]);

  useEffect(() => {
    // Authentication is now handled by HttpOnly cookies and API interceptor
    // No need to check localStorage token

    if (daniMemberNo) {
      fetchMemberProfile();
    }
  }, [daniMemberNo, navigate, selectedYear, fetchMemberProfile]);

  const formatCurrency = (amount) => {
    // Convert amount to number and format with Indian number system
    const numAmount = Number(amount) || 0;
    
    // Format number with Indian comma system
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(numAmount);
    
    // Use "Rs." instead of ₹ symbol to avoid font rendering issues
    const result = `Rs. ${formattedNumber}`;
    return result;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateDonationReceiptPDF = () => {
    if (!member) {
      toast.error('Member data not available to generate PDF');
      return;
    }

    try {
      console.log('Starting comprehensive PDF generation...');
      
      const doc = new jsPDF();
      
      // Set font to 'times' which has better Unicode support for the Rupee symbol
      doc.setFont('times', 'normal');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Professional Header with Improved Spacing
      doc.setFontSize(20);
      doc.setFont('times', 'bold');
      doc.text('VRIDHAJAN SAHYOG', 20, yPosition);
      
      doc.setFontSize(14);
      doc.setFont('times', 'normal');
      doc.text('Charitable Trust', 20, yPosition + 8);
      
      // Document Title (Right aligned) with increased spacing
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('MEMBER DONATION STATEMENT', pageWidth - 20, yPosition + 15, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      doc.text('(Original for Member)', pageWidth - 20, yPosition + 23, { align: 'right' });
      yPosition += 35;

      // Member Information Section (Two Column Layout) - Properly Aligned
      const rightColumnX = pageWidth / 2 + 10;
      const sectionStartY = yPosition;
      
      // Left Column - Member Basic Info
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('Member Information:', 20, sectionStartY);
      
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      let leftY = sectionStartY + 8;
      doc.text(`Name: ${member.memberName}`, 20, leftY);
      leftY += 5;
      doc.text(`Registration No: ${member.regNo || 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Dani Member No: ${member.daniMemberNo || 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Father/Husband: ${member.fatherHusbandName || 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Date of Birth: ${member.personal?.dateOfBirth ? formatDate(member.personal.dateOfBirth) : 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Registration Date: ${member.registrationDate ? formatDate(member.registrationDate) : 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Classification: ${member.personal?.occupation || 'N/A'}`, 20, leftY);
      leftY += 5;
      doc.text(`Validity: ${member.membership?.validity ? formatDate(member.membership.validity) : 'N/A'}`, 20, leftY);

      // Right Column - Contact & Address (Aligned to same Y position)
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('Contact & Address:', rightColumnX, sectionStartY);
      
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      let rightY = sectionStartY + 8;
      doc.text(`Phone: ${member.contact?.mob1 || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`Email: ${member.contact?.emailId || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`Address: ${member.address?.address || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`${member.address?.city || 'N/A'}, ${member.address?.state || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`PIN: ${member.address?.pincode || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`State/UT Code: ${member.address?.stateCode || 'N/A'}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`Country: ${member.address?.country || 'India'}`, rightColumnX, rightY);
      
      // Set yPosition to the maximum of both columns plus spacing
      yPosition = Math.max(leftY, rightY) + 15;

      // Statement Period
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text(`Statement Period: ${selectedYear}`, 20, yPosition);
      yPosition += 10;

      // Summary Statistics with Enhanced Font Styling
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('Summary:', 20, yPosition);
      yPosition += 8;

      // Key statistics with bold font and larger size
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text(`Total Donations: ${formatCurrency(statistics.totalDonations || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Total Receipts: ${statistics.totalReceipts || 0}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Average Donation: ${formatCurrency(statistics.averageDonation || 0)}`, 20, yPosition);
      yPosition += 8;

      // Additional details with normal font
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`First Donation: ${statistics.firstDonationDate ? formatDate(statistics.firstDonationDate) : 'N/A'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Last Donation: ${statistics.lastDonationDate ? formatDate(statistics.lastDonationDate) : 'N/A'}`, 20, yPosition);
      yPosition += 15;

      // Monthly Donations Summary (if available)
      if (monthlyDonations && monthlyDonations.length > 0) {
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Monthly Donations Summary:', 20, yPosition);
        yPosition += 8;

        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        monthlyDonations.forEach((monthData, index) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          
          const monthName = monthData.month;
          const amount = monthData.amount ? formatCurrency(monthData.amount) : formatCurrency(0);
          const count = monthData.receiptCount || 0;
          doc.text(`${monthName}: ${amount} (${count} receipt${count !== 1 ? 's' : ''})`, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Complete Donation History Table
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('Complete Donation History', 20, yPosition);
      yPosition += 10;

      // Table headers with better spacing
      const tableHeaders = ['Sl. No', 'Receipt Date', 'Receipt No.', 'Book No.', 'Amount', 'Payment Mode', 'Remarks'];
      const colWidths = [12, 28, 25, 18, 30, 22, 45];
      let xPosition = 20;

      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      tableHeaders.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 6;

      // Draw line under headers
      doc.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
      yPosition += 5;

      // Table rows with all donation entries
      doc.setFont('times', 'normal');
      receipts.forEach((receipt, index) => {
        try {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
            
            // Redraw headers on new page
            xPosition = 20;
            doc.setFontSize(9);
            doc.setFont('times', 'bold');
            tableHeaders.forEach((header, headerIndex) => {
              doc.text(header, xPosition, yPosition);
              xPosition += colWidths[headerIndex];
            });
            yPosition += 6;
            doc.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
            yPosition += 5;
          }

          xPosition = 20;
          const rowData = [
            (index + 1).toString(),
            receipt.receiptDate ? formatDate(receipt.receiptDate) : 'N/A',
            receipt.receiptNo || 'N/A',
            receipt.bookNo || 'N/A',
            receipt.amount ? formatCurrency(receipt.amount) : formatCurrency(0),
            receipt.paymentMode || 'N/A',
            receipt.remarks || '-'
          ];

          rowData.forEach((data, colIndex) => {
            // Truncate long text for remarks
            let displayText = String(data);
            if (colIndex === 6 && displayText.length > 20) { // Remarks column
              displayText = displayText.substring(0, 17) + '...';
            }
            doc.text(displayText, xPosition, yPosition);
            xPosition += colWidths[colIndex];
          });
          yPosition += 5;
        } catch (rowError) {
          console.error(`Error processing receipt row ${index}:`, rowError);
          // Skip this row and continue
        }
      });

      // Grand Total Section with Enhanced Styling
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('GRAND TOTAL:', pageWidth - 80, yPosition, { align: 'right' });
      doc.setFontSize(14);
      doc.text(formatCurrency(statistics.totalDonations || 0), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 10;

      // Amount in Words
      try {
        const amountInWords = convertToWords(statistics.totalDonations || 0);
        doc.setFont('times', 'bold');
        doc.text(`Amount in Words: Rupees ${amountInWords} only`, 20, yPosition);
      } catch (wordsError) {
        console.error('Error converting amount to words:', wordsError);
        doc.setFont('times', 'bold');
        doc.text(`Amount in Words: Rupees ${formatCurrency(statistics.totalDonations || 0)} only`, 20, yPosition);
      }
      yPosition += 15;

      // Footer Section
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text('This is a computer generated statement.', 20, yPosition);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 10;

      // Authorized Signatory Section
      doc.setFont('times', 'bold');
      doc.text('For VRIDHAJAN SAHYOG:', pageWidth - 80, yPosition, { align: 'right' });
      yPosition += 20;
      doc.setFont('times', 'normal');
      doc.text('Authorized Signatory', pageWidth - 80, yPosition, { align: 'right' });

      // Save the PDF
      try {
        const fileName = `Member_Donation_Statement_${member.memberName.replace(/\s+/g, '_')}_${selectedYear}.pdf`;
        doc.save(fileName);
        console.log('Comprehensive PDF saved successfully:', fileName);
        toast.success('Comprehensive donation statement generated successfully!');
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        toast.error('Error saving PDF file. Please try again.');
      }
    } catch (error) {
      console.error('Error generating comprehensive PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Helper function to convert numbers to words
  const convertToWords = (num) => {
    try {
      // Handle edge cases
      if (num === null || num === undefined || isNaN(num)) {
        return 'Zero';
      }
      
      // Convert to integer
      num = Math.floor(Number(num));
      
      if (num === 0) return 'Zero';
      if (num < 0) return 'Negative ' + convertToWords(-num);
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      const convertHundreds = (n) => {
        let result = '';
        if (n > 99) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n > 19) {
          result += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        } else if (n > 9) {
          result += teens[n - 10] + ' ';
          return result;
        }
        if (n > 0) {
          result += ones[n] + ' ';
        }
        return result;
      };

      let result = '';
      const crores = Math.floor(num / 10000000);
      const lakhs = Math.floor((num % 10000000) / 100000);
      const thousands = Math.floor((num % 100000) / 1000);
      const hundreds = num % 1000;

      if (crores > 0) {
        result += convertHundreds(crores) + 'Crore ';
      }
      if (lakhs > 0) {
        result += convertHundreds(lakhs) + 'Lakh ';
      }
      if (thousands > 0) {
        result += convertHundreds(thousands) + 'Thousand ';
      }
      if (hundreds > 0) {
        result += convertHundreds(hundreds);
      }

      return result.trim() || 'Zero';
    } catch (error) {
      console.error('Error in convertToWords:', error);
      return 'Zero';
    }
  };

  if (loading) {
    return (
      <div className="member-profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-profile-container">
        <div className="error-container">
          <h2>Member not found</h2>
          <p>The requested member profile could not be found.</p>
          <Link to="/member-list" className="btn btn-primary">
            Back to Member List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="member-profile-container">
      {/* Minimal Header */}
      <div className="profile-header">
        <Link to="/member-list" className="back-btn">
          ← Back to Member List
        </Link>
        <h1>👤 Member Profile</h1>
      </div>

      <div className="profile-content">
        {/* Minimal Member Information */}
        <div className="member-info-card">
          <div className="member-avatar">
            <div className="avatar-circle">
              {getInitials(member.memberName)}
            </div>
          </div>
          <div className="member-details">
            <h2 className="member-name">{member.memberName}</h2>
            <div className="member-meta">
              <div className="meta-item">
                <span className="meta-icon">🏷️</span>
                <span className="meta-value">Reg: {member.regNo}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📱</span>
                <span className="meta-value">{member.contact?.mob1}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-value">
                  {member.address?.city && member.address?.state 
                    ? `${member.address.city}, ${member.address.state}`
                    : 'N/A'
                  }
                </span>
              </div>
              {member.fatherHusbandName && (
                <div className="meta-item">
                  <span className="meta-icon">👨‍👩‍👧‍👦</span>
                  <span className="meta-value">{member.fatherHusbandName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Statistics */}
        <div className="statistics-grid">
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{formatCurrency(statistics.totalDonations)}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{statistics.totalReceipts}</span>
            <span className="stat-label">Receipts</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <span className="stat-value">{formatCurrency(statistics.averageDonation)}</span>
            <span className="stat-label">Average</span>
          </div>
        </div>

        {/* Year Filter */}
        <div className="filter-section">
          <span className="filter-icon">📅</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Monthly Donations Summary */}
        {monthlyDonations.length > 0 && (
          <div className="monthly-donations-section">
            <h3>📊 Monthly Donations - {selectedYear}</h3>
            <div className="monthly-list">
              {monthlyDonations
                .filter(monthData => monthData.amount > 0 || monthData.receiptCount > 0)
                .map((monthData, index) => (
                  <div key={index} className="month-item">
                    <div className="month-label">{monthData.month}</div>
                    <div className="month-amount">{formatCurrency(monthData.amount)}</div>
                    <div className="month-count">{monthData.receiptCount} receipt{monthData.receiptCount !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              {monthlyDonations.filter(monthData => monthData.amount > 0 || monthData.receiptCount > 0).length === 0 && (
                <div className="no-monthly-data">
                  <p>No donations found for {selectedYear}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donation History */}
        <div className="donation-history-section">
          <h3>📋 Donation History</h3>
          <div className="history-container">
            {receipts.length === 0 ? (
              <div className="no-history">
                <div className="no-history-icon">📝</div>
                <h4>No donations found</h4>
                <p>No donations found for the selected year.</p>
              </div>
            ) : (
              <div className="history-table">
                <div className="history-header">
                  <div className="col-date">Date</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-book">Book No.</div>
                  <div className="col-receipt">Receipt No.</div>
                  <div className="col-payment-id">Payment ID</div>
                  <div className="col-mode">Payment Mode</div>
                  <div className="col-remarks">Remarks</div>
                </div>
                {receipts.map((receipt, index) => (
                  <div key={receipt._id || index} className="history-row">
                    <div className="col-date">{formatDate(receipt.receiptDate)}</div>
                    <div className="col-amount">{formatCurrency(receipt.amount)}</div>
                    <div className="col-book">{receipt.bookNo || 'N/A'}</div>
                    <div className="col-receipt">{receipt.receiptNo || 'N/A'}</div>
                    <div className="col-payment-id">{receipt.paymentId || 'N/A'}</div>
                    <div className="col-mode">
                      <span className={`payment-mode ${receipt.paymentMode.toLowerCase()}`}>
                        {receipt.paymentMode}
                      </span>
                    </div>
                    <div className="col-remarks">{receipt.remarks || '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link 
            to={`/receipt-entry`} 
            state={{ selectedMember: member }}
            className="btn btn-primary"
          >
            💰 New Receipt
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={generateDonationReceiptPDF}
          >
            🖨️ Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
