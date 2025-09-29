import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';
import './ReceiptEntry.css';

const ReceiptEntry = () => {
  // State management for the form
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingReceiptId, setEditingReceiptId] = useState(null);
  const [memberReceiptHistory, setMemberReceiptHistory] = useState([]);
  
  // Calculate initial financial year based on current date
  const getInitialFinancialYear = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    let fyStartYear, fyEndYear;
    if (month >= 4) {
      fyStartYear = year;
      fyEndYear = year + 1;
    } else {
      fyStartYear = year - 1;
      fyEndYear = year;
    }
    
    return `F.Y. ${fyStartYear}-${fyEndYear.toString().slice(-2)}`;
  };

  // Form data state
  const [receiptData, setReceiptData] = useState({
    member: '', // This will be the universalKey of the member
    amount: '',
    receiptDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    fyYear: getInitialFinancialYear(),
    bookNo: '',
    receiptNo: '',
    paymentId: '',
    remarks: '',
    daniSlNo: '',
    regDate: new Date().toISOString().split('T')[0]
  });

  // Member data state
  const [memberData, setMemberData] = useState({
    daniMemberNo: '',
    memberName: '',
    fatherHusbandName: '',
    dateOfBirth: '',
    mobileNumber: '',
    validity: '',
    registrationDate: ''
  });

  // Form validation state
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [isValidMember, setIsValidMember] = useState(false);
  const [bookRange, setBookRange] = useState({ start: 1, end: 25 });
  const [isBookFull, setIsBookFull] = useState(false);
  const [bookCount, setBookCount] = useState(0);
  const [receiptValidation, setReceiptValidation] = useState({
    isValid: true,
    message: '',
    isChecking: false
  });

  // Financial Year Options
  const fyYearOptions = [
    'F.Y. 2025-26',
    'F.Y. 2024-25',
    'F.Y. 2023-24',
    'F.Y. 2022-23'
  ];

  // Payment Mode Options
  const paymentModeOptions = [
    'CASH',
    'NEFT',
    'IMPS',
    'UPI',
    'RTGS',
    'Cheque',
    'Online Payment',
    'Cash Deposit',
    'TPFT',
    'Swipe',
    'Paytm'
  ];

  // State for payment mode suggestions
  const [paymentModeSuggestions, setPaymentModeSuggestions] = useState([]);
  const [showPaymentModeSuggestions, setShowPaymentModeSuggestions] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close auto-complete dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowPaymentModeSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ==================== AUTO-SUGGEST FUNCTIONS ====================
  
  // Payment Mode Auto-suggest
  const handlePaymentModeInput = (value) => {
    if (value.length > 0) {
      const filtered = paymentModeOptions.filter(mode =>
        mode.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      setPaymentModeSuggestions(filtered);
      setShowPaymentModeSuggestions(true);
    } else {
      setPaymentModeSuggestions([]);
      setShowPaymentModeSuggestions(false);
    }
  };

  const selectPaymentMode = (mode) => {
    setReceiptData(prev => ({
      ...prev,
      paymentMode: mode
    }));
    setShowPaymentModeSuggestions(false);
  };

  // ==================== CRUD FUNCTIONS ====================

  // A. MEMBER VALIDATION - Validate member by Dani Member Number
  const validateMemberByDaniNumber = useCallback(async (daniMemberNo) => {
    if (!daniMemberNo.trim()) {
      setIsValidMember(false);
      setIsFormDisabled(true);
      setMemberData({
        daniMemberNo: '',
        memberName: '',
        fatherHusbandName: '',
        dateOfBirth: '',
        mobileNumber: '',
        validity: '',
        registrationDate: ''
      });
      
      // Remove dani_member parameter from URL when field is cleared
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('dani_member');
      window.history.replaceState({}, '', currentUrl.toString());
      
      return;
    }

    setSearchLoading(true);
    try {
      const response = await API.get(`/members/dani/${daniMemberNo}`);
      
      if (response.data.success) {
        const member = response.data.data;
        
        // Format date for display
        const formatDateForDisplay = (dateString) => {
          if (!dateString) return '';
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch (error) {
            return '';
          }
        };

        setMemberData({
          daniMemberNo: member.daniMemberNo,
          memberName: member.memberName,
          fatherHusbandName: member.fatherHusbandName,
          dateOfBirth: formatDateForDisplay(member.personal?.dateOfBirth),
          mobileNumber: member.contact?.mob1 || '',
          validity: formatDateForDisplay(member.membership?.validity),
          registrationDate: formatDateForDisplay(member.registrationDate)
        });

        setReceiptData(prev => ({
          ...prev,
          member: member.universalKey,
          daniSlNo: member.regNo || '',
          regDate: formatDateForDisplay(member.registrationDate)
        }));

        setIsValidMember(true);
        setIsFormDisabled(false);
        setSelectedMember(member);
        
        // Update URL to include dani_member parameter
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('dani_member', daniMemberNo);
        window.history.replaceState({}, '', currentUrl.toString());
        
        // Load member's receipt history
        loadMemberReceiptHistory(member.universalKey);
        
        toast.success('Member validated successfully!');
      } else {
        setIsValidMember(false);
        setIsFormDisabled(true);
        setMemberData({
          daniMemberNo: '',
          memberName: '',
          fatherHusbandName: '',
          dateOfBirth: '',
          mobileNumber: '',
          validity: '',
          registrationDate: ''
        });
        
        // Remove dani_member parameter from URL when member not found
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.delete('dani_member');
        window.history.replaceState({}, '', currentUrl.toString());
        
        toast.error('Please register the member first');
      }
    } catch (error) {
      console.error('Error validating member:', error);
      setIsValidMember(false);
      setIsFormDisabled(true);
      setMemberData({
        daniMemberNo: '',
        memberName: '',
        fatherHusbandName: '',
        dateOfBirth: '',
        mobileNumber: '',
        validity: '',
        registrationDate: ''
      });
      
      // Remove dani_member parameter from URL when API error occurs
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('dani_member');
      window.history.replaceState({}, '', currentUrl.toString());
      
      toast.error('Please register the member first');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // B. BOOK & RECEIPT NUMBER LOGIC - Get next receipt number for book
  const getNextReceiptNumber = async (bookNo) => {
    if (!bookNo || bookNo < 1) {
      setReceiptData(prev => ({ ...prev, receiptNo: '' }));
      return;
    }

    try {
      const response = await API.get(`/receipts/next-receipt/${bookNo}`);
      
      if (response.data.success) {
        const { nextReceiptNo, validRange } = response.data.data;
        setReceiptData(prev => ({ ...prev, receiptNo: nextReceiptNo }));
        setBookRange(validRange);
        toast.info(`Book ${bookNo} range: ${validRange.start}-${validRange.end}`);
      } else {
        toast.error(response.data.message);
        setReceiptData(prev => ({ ...prev, receiptNo: '' }));
      }
    } catch (error) {
      console.error('Error getting next receipt number:', error);
      toast.error('Error getting next receipt number');
      setReceiptData(prev => ({ ...prev, receiptNo: '' }));
    }
  };

  // C. DUPLICATE VALIDATION - Check if receipt combination exists
  const checkReceiptDuplicate = async (bookNo, receiptNo) => {
    if (!bookNo || !receiptNo || bookNo < 1 || receiptNo < 1) {
      setReceiptValidation({
        isValid: true,
        message: '',
        isChecking: false
      });
      return;
    }

    console.log(`Validating receipt: Book ${bookNo}, Receipt ${receiptNo}`);
    setReceiptValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await API.get(`/receipts/check-duplicate/${bookNo}/${receiptNo}`);
      
      if (response.data.success) {
        const { exists, valid, message } = response.data.data;
        console.log(`Validation result: exists=${exists}, valid=${valid}, message="${message}"`);
        setReceiptValidation({
          isValid: valid && !exists,
          message: message,
          isChecking: false
        });
      } else {
        setReceiptValidation({
          isValid: false,
          message: 'Error checking receipt combination',
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Error checking receipt duplicate:', error);
      setReceiptValidation({
        isValid: false,
        message: 'Error checking receipt combination',
        isChecking: false
      });
    }
  };

  // D. BOOK FULL VALIDATION - Check if a book is full (25 receipts)
  const checkBookFull = async (bookNo) => {
    if (!bookNo || bookNo < 1) {
      setIsBookFull(false);
      setBookCount(0);
      return false;
    }

    try {
      console.log(`Checking if book ${bookNo} is full...`);
      const response = await API.get(`/receipts/book-count/${bookNo}`);
      
      if (response.data.success) {
        const { count, isFull } = response.data.data;
        console.log(`Book ${bookNo}: ${count}/25 receipts, isFull: ${isFull}`);
        
        // Update state
        setIsBookFull(isFull);
        setBookCount(count);
        
        if (isFull) {
          // Show both toast and alert for better visibility
          toast.error(`This receipt book is full (${count}/25 receipts). Please select a new book number.`);
          alert(`⚠️ BOOK FULL ALERT ⚠️\n\nThis receipt book (Book ${bookNo}) is full with ${count}/25 receipts.\n\nPlease select a new book number to continue.`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking book count:', error);
      setIsBookFull(false);
      setBookCount(0);
      return false;
    }
  };


  // Check authentication and handle pre-filled data
  useEffect(() => {
    // Authentication is now handled by HttpOnly cookies and API interceptor
    // No need to check localStorage token

    // Check for dani_member query parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const daniMemberFromUrl = urlParams.get('dani_member');

    // Handle pre-filled member data from URL query parameter
    if (daniMemberFromUrl) {
      setMemberData(prev => ({
        ...prev,
        daniMemberNo: daniMemberFromUrl
      }));
      // Automatically validate the member
      validateMemberByDaniNumber(daniMemberFromUrl);
      // Show a toast to indicate the page was loaded with URL parameter
      toast.info(`Loading member data for Dani Member No. ${daniMemberFromUrl}...`);
    }
    // Handle pre-filled member data from MemberList or MemberProfile
    else if (location.state?.prefillDaniMemberNo) {
      setMemberData(prev => ({
        ...prev,
        daniMemberNo: location.state.prefillDaniMemberNo
      }));
      // Automatically validate the member
      validateMemberByDaniNumber(location.state.prefillDaniMemberNo);
    } else if (location.state?.selectedMember) {
      // Handle pre-filled member data from MemberProfile
      const member = location.state.selectedMember;
      setMemberData({
        daniMemberNo: member.daniMemberNo,
        memberName: member.memberName,
        fatherHusbandName: member.fatherHusbandName,
        dateOfBirth: member.personal?.dateOfBirth ? new Date(member.personal.dateOfBirth).toISOString().split('T')[0] : '',
        mobileNumber: member.contact?.mob1 || '',
        validity: member.membership?.validity ? new Date(member.membership.validity).toISOString().split('T')[0] : '',
        registrationDate: member.registrationDate ? new Date(member.registrationDate).toISOString().split('T')[0] : ''
      });
      
      setReceiptData(prev => ({
        ...prev,
        member: member.universalKey,
        daniSlNo: member.regNo || '',
        regDate: member.registrationDate ? new Date(member.registrationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));

      setIsValidMember(true);
      setIsFormDisabled(false);
      setSelectedMember(member);
      
      // Load member's receipt history
      loadMemberReceiptHistory(member.universalKey);
      
      toast.success('Member data loaded successfully!');
    }
  }, [navigate, location.state, location.search, validateMemberByDaniNumber]);

  const loadMemberReceiptHistory = async (universalKey) => {
    try {
      const response = await API.get(`/receipts/member/${universalKey}`);
      
      if (response.data.success) {
        setMemberReceiptHistory(response.data.data.receipts || []);
      } else {
        setMemberReceiptHistory([]);
      }
    } catch (error) {
      console.error('Error loading member history:', error);
      setMemberReceiptHistory([]);
    }
  };

  // B. CREATE - Save new receipt
  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    
    if (!isValidMember) {
      toast.error('Please enter a valid Dani Member Number first');
      return;
    }
    
    if (!receiptData.amount || parseFloat(receiptData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!receiptData.bookNo || parseInt(receiptData.bookNo) < 1) {
      toast.error('Please enter a valid book number');
      return;
    }

    if (!receiptData.receiptNo || parseInt(receiptData.receiptNo) < 1) {
      toast.error('Please enter a valid receipt number');
      return;
    }

    // Check if receipt validation is still in progress
    if (receiptValidation.isChecking) {
      toast.error('Please wait while we validate the receipt combination');
      return;
    }

    // Check if receipt combination is invalid
    if (!receiptValidation.isValid) {
      toast.error(receiptValidation.message || 'Invalid receipt combination');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        member: selectedMember.universalKey,
        amount: parseFloat(receiptData.amount),
        receiptDate: receiptData.receiptDate,
        paymentMode: receiptData.paymentMode,
        fyYear: receiptData.fyYear,
        bookNo: parseInt(receiptData.bookNo),
        receiptNo: receiptData.receiptNo || undefined,
        remarks: receiptData.remarks
      };
      
      const response = await API.post('/receipts', submitData);
      
      if (response.data.success) {
        toast.success('Receipt created successfully!');
        
        // Auto-increment logic for next receipt
        const currentBookNo = parseInt(receiptData.bookNo);
        const currentReceiptNo = parseInt(receiptData.receiptNo);
        const bookEnd = currentBookNo * 25; // Each book has 25 receipts
        
        let nextBookNo = currentBookNo;
        let nextReceiptNo = currentReceiptNo + 1;
        
        // Check if we've reached the end of the current book
        if (currentReceiptNo >= bookEnd) {
          // Move to next book and start from the beginning of that book
          nextBookNo = currentBookNo + 1;
          nextReceiptNo = (nextBookNo - 1) * 25 + 1;
        }
        
        // Update form with next receipt numbers
        setReceiptData(prev => ({
          ...prev,
          bookNo: nextBookNo.toString(),
          receiptNo: nextReceiptNo.toString(),
          amount: '', // Clear amount for next entry
          remarks: '', // Clear remarks for next entry
          // Keep the same receipt date and auto-calculate FY
          fyYear: calculateFinancialYear(prev.receiptDate)
        }));
        
        // Get the valid range for the new book
        if (nextBookNo !== currentBookNo) {
          getNextReceiptNumber(nextBookNo);
        }
        
        // Don't reset form - keep all data for potential additional receipts
        loadMemberReceiptHistory(selectedMember.universalKey);
      } else {
        toast.error(response.data.message || 'Failed to create receipt');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create receipt. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // C. READ - Load receipt for editing
  const handleEditReceipt = async (receiptId) => {
    setLoading(true);
    try {
      const response = await API.get(`/receipts/${receiptId}`);
      
      if (response.data.success) {
        const receipt = response.data.data.receipt;
        setEditingReceiptId(receiptId);
        
        // Populate form with receipt data
        setReceiptData({
          member: receipt.member.universalKey,
          amount: receipt.amount.toString(),
          receiptDate: receipt.receiptDate.split('T')[0],
          paymentMode: receipt.paymentMode,
          fyYear: receipt.fyYear,
          bookNo: receipt.bookNo || '',
          receiptNo: receipt.receiptNo || '',
          uniqueRegNo: receipt.uniqueRegNo || '',
          id: receipt.id || '',
          remarks: receipt.remarks || '',
          daniSlNo: receipt.member.regNo || '',
          regDate: receipt.member.registrationDate ? receipt.member.registrationDate.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        // Set selected member
        setSelectedMember(receipt.member);
        
        toast.success('Receipt loaded for editing');
      } else {
        toast.error('Failed to load receipt');
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      toast.error('Failed to load receipt for editing');
    } finally {
      setLoading(false);
    }
  };

  // D. UPDATE - Update existing receipt
  const handleUpdateReceipt = async (e) => {
    e.preventDefault();
    
    if (!editingReceiptId) {
      toast.error('No receipt selected for update');
      return;
    }
    
    if (!selectedMember) {
      toast.error('Please select a member first');
      return;
    }
    
    if (!receiptData.amount || parseFloat(receiptData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        member: selectedMember.universalKey,
        amount: parseFloat(receiptData.amount),
        receiptDate: receiptData.receiptDate,
        paymentMode: receiptData.paymentMode,
        fyYear: receiptData.fyYear,
        bookNo: parseInt(receiptData.bookNo),
        receiptNo: receiptData.receiptNo || undefined,
        remarks: receiptData.remarks
      };
      
      const response = await API.put(`/receipts/${editingReceiptId}`, updateData);
      
      if (response.data.success) {
        toast.success('Receipt updated successfully!');
        
        // Reset receipt form for new entry while keeping member details
        const currentDate = new Date().toISOString().split('T')[0];
        setReceiptData(prev => ({
          ...prev,
          amount: '',
          receiptDate: currentDate,
          paymentMode: 'CASH',
          fyYear: calculateFinancialYear(currentDate),
          bookNo: '',
          receiptNo: '',
          remarks: ''
        }));
        
        // Clear editing state
        setEditingReceiptId(null);
        
        // Clear validation states
        setReceiptValidation({
          isValid: true,
          message: '',
          isChecking: false
        });
        setIsBookFull(false);
        setBookCount(0);
        
        // Reload member's receipt history
        loadMemberReceiptHistory(selectedMember.universalKey);
        
        // Inform user that form is ready for new entry
        toast.info('Form reset for new receipt entry');
      } else {
        toast.error(response.data.message || 'Failed to update receipt');
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update receipt. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // E. DELETE - Delete receipt with confirmation
  const handleDeleteReceipt = async () => {
    if (!editingReceiptId) {
      toast.error('No receipt selected for deletion');
      return;
    }

    setLoading(true);
    try {
      const response = await API.delete(`/receipts/${editingReceiptId}`);
      
      if (response.data.success) {
        toast.success('Receipt deleted successfully!');
        resetForm();
        if (selectedMember) {
          loadMemberReceiptHistory(selectedMember.universalKey);
        }
      } else {
        toast.error(response.data.message || 'Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete receipt. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // F. RESET FORM - Clear all form data
  const resetForm = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    setReceiptData({
      member: '',
      amount: '',
      receiptDate: currentDate,
      paymentMode: 'CASH',
      fyYear: calculateFinancialYear(currentDate),
      bookNo: '',
      receiptNo: '',
      paymentId: '',
      remarks: '',
      daniSlNo: '',
      regDate: currentDate
    });
    setMemberData({
      daniMemberNo: '',
      memberName: '',
      fatherHusbandName: '',
      dateOfBirth: '',
      mobileNumber: '',
      validity: '',
      registrationDate: ''
    });
    setSelectedMember(null);
    setEditingReceiptId(null);
    setMemberReceiptHistory([]);
    setIsValidMember(false);
    setIsFormDisabled(true);
    setBookRange({ start: 1, end: 25 });
    setIsBookFull(false);
    setBookCount(0);
    setReceiptValidation({
      isValid: true,
      message: '',
      isChecking: false
    });
    
    // Remove dani_member parameter from URL when form is reset
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.delete('dani_member');
    window.history.replaceState({}, '', currentUrl.toString());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle Dani Member Number validation
    if (name === 'daniMemberNo') {
      setMemberData(prev => ({ ...prev, daniMemberNo: value }));
      
      // If Dani Member Number changes, clear receipt form data but keep member data
      if (value !== memberData.daniMemberNo) {
        const currentDate = new Date().toISOString().split('T')[0];
        setReceiptData(prev => ({
          ...prev,
          amount: '',
          receiptDate: currentDate,
          paymentMode: 'CASH',
          fyYear: calculateFinancialYear(currentDate),
          bookNo: '',
          receiptNo: '',
          remarks: ''
        }));
        setEditingReceiptId(null);
        setReceiptValidation({
          isValid: true,
          message: '',
          isChecking: false
        });
      }
      
      // Debounce member validation
      if (value.trim()) {
        const timeoutId = setTimeout(() => {
          validateMemberByDaniNumber(value.trim());
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      } else {
        setIsValidMember(false);
        setIsFormDisabled(true);
      }
      return;
    }
    
    // Handle Book Number change - get next receipt number
    if (name === 'bookNo') {
      setReceiptData(prev => {
        const newBookNo = value;
        
        if (newBookNo && parseInt(newBookNo) > 0) {
          // Check if book is full first
          checkBookFull(parseInt(newBookNo));
          
          // Get next receipt number for the new book
          getNextReceiptNumber(parseInt(newBookNo));
          
          // Clear validation when book changes
          setReceiptValidation({
            isValid: true,
            message: '',
            isChecking: false
          });
        } else {
          setReceiptValidation({
            isValid: true,
            message: '',
            isChecking: false
          });
        }
        
        return { ...prev, bookNo: newBookNo };
      });
      return;
    }
    
    // Handle Receipt Number validation
    if (name === 'receiptNo') {
      setReceiptData(prev => {
        const receiptNumber = parseInt(value);
        const bookNumber = parseInt(prev.bookNo); // Use prev.bookNo to get the current state
        
        if (bookNumber && receiptNumber) {
          // Clear any existing validation
          setReceiptValidation({
            isValid: true,
            message: '',
            isChecking: false
          });
          
          // Debounce the duplicate check
          setTimeout(() => {
            checkReceiptDuplicate(bookNumber, receiptNumber);
          }, 500);
        } else {
          setReceiptValidation({
            isValid: true,
            message: '',
            isChecking: false
          });
        }
        
        return { ...prev, receiptNo: value };
      });
      return;
    }
    
    // Handle receipt date change - automatically update financial year
    if (name === 'receiptDate') {
      const calculatedFY = calculateFinancialYear(value);
      setReceiptData(prev => ({
        ...prev,
        [name]: value,
        fyYear: calculatedFY
      }));
      return;
    }
    
    setReceiptData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================== UTILITY FUNCTIONS ====================

  // Calculate financial year from a given date
  const calculateFinancialYear = (dateString) => {
    if (!dateString) return 'F.Y. 2025-26';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
      
      // Financial year in India runs from April 1 to March 31
      // If month is April (4) or later, it's the current financial year
      // If month is before April, it's the previous financial year
      let fyStartYear, fyEndYear;
      
      if (month >= 4) {
        // April to December: FY starts in current year
        fyStartYear = year;
        fyEndYear = year + 1;
      } else {
        // January to March: FY started in previous year
        fyStartYear = year - 1;
        fyEndYear = year;
      }
      
      return `F.Y. ${fyStartYear}-${fyEndYear.toString().slice(-2)}`;
    } catch (error) {
      console.error('Error calculating financial year:', error);
      return 'F.Y. 2025-26'; // Default fallback
    }
  };

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

  return (
    <div className="receipt-entry-container">
      {/* Header Section */}
      <div className="form-header">
        <div className="header-left">Receipt Entry :::</div>
        <div className="header-center">Dani Sahyogi</div>
        <div className="header-right">
          Reg. Date : {new Date().toLocaleDateString('en-IN')}
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      <form className="receipt-form" onSubmit={editingReceiptId ? handleUpdateReceipt : handleCreateReceipt}>
        {/* Unified Form Container */}
        <div className="unified-form-container">
          {/* Row 1: Member Validation */}
          <div className="form-row">
            <div className="form-group">
              <label>Dani Member No. :</label>
              <input
                type="text"
                name="daniMemberNo"
                value={memberData.daniMemberNo}
                onChange={handleInputChange}
                placeholder="Enter Dani Member Number"
                disabled={loading || searchLoading}
                required
              />
              {searchLoading && (
                <span className="loading-indicator">🔍 Validating...</span>
              )}
            </div>
            <button type="button" className="refresh-btn" onClick={resetForm}>
              Refresh
            </button>
          </div>

          {/* Row 2: Member Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Reg. No. :</label>
              <input
                type="text"
                value={receiptData.daniSlNo}
                readOnly
                placeholder="Auto-filled after validation"
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Member Name :</label>
              <input
                type="text"
                value={memberData.memberName}
                readOnly
                placeholder="Auto-filled after validation"
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>F/H/D/S of Name :</label>
              <input
                type="text"
                value={memberData.fatherHusbandName}
                readOnly
                placeholder="Auto-filled after validation"
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth :</label>
              <input
                type="date"
                value={memberData.dateOfBirth}
                readOnly
                className="readonly-field"
              />
            </div>
          </div>

          {/* Row 3: Contact & Validity */}
          <div className="form-row">
            <div className="form-group">
              <label>Mobile Number :</label>
              <input
                type="text"
                value={memberData.mobileNumber}
                readOnly
                placeholder="Auto-filled after validation"
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Validity :</label>
              <input
                type="date"
                value={memberData.validity}
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Registration Date :</label>
              <input
                type="date"
                value={memberData.registrationDate}
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Fy. Year : <span className="auto-calculated-indicator">(Auto-calculated)</span></label>
              <select
                name="fyYear"
                value={receiptData.fyYear}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                required
                className="auto-calculated-field"
              >
                {fyYearOptions.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
              <span className="auto-calculated-note">
                📅 Automatically calculated from Receipt Date
              </span>
            </div>
          </div>

          {/* Row 4: Receipt Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Book No. :</label>
              <input
                type="number"
                name="bookNo"
                value={receiptData.bookNo}
                onChange={handleInputChange}
                placeholder="Enter book number"
                disabled={isFormDisabled}
                min="1"
                required
                autoComplete="off"
                className={isBookFull ? 'book-full-error' : ''}
              />
              {receiptData.bookNo && (
                <span className={`book-status-indicator ${isBookFull ? 'book-full' : 'book-available'}`}>
                  {isBookFull ? `⚠️ FULL (${bookCount}/25)` : `✅ Available (${bookCount}/25)`}
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Receipt No. :</label>
              <input
                type="number"
                name="receiptNo"
                value={receiptData.receiptNo}
                onChange={handleInputChange}
                placeholder="Enter receipt number"
                disabled={isFormDisabled}
                min="1"
                required
                autoComplete="off"
                className={receiptValidation.isValid ? '' : 'invalid-field'}
              />
              {receiptData.bookNo && (
                <span className="range-indicator">
                  Range: {bookRange.start}-{bookRange.end}
                </span>
              )}
              {receiptValidation.isChecking && (
                <span className="validation-indicator checking">
                  🔍 Checking...
                </span>
              )}
              {!receiptValidation.isChecking && receiptValidation.message && (
                <span className={`validation-indicator ${receiptValidation.isValid ? 'valid' : 'invalid'}`}>
                  {receiptValidation.isValid ? '✅' : '❌'} {receiptValidation.message}
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Payment ID :</label>
              <input
                type="text"
                value={receiptData.paymentId}
                readOnly
                placeholder="Auto-generated"
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Rec. Amount :</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={receiptData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={isFormDisabled}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>Receipt Date :</label>
              <input
                type="date"
                name="receiptDate"
                value={receiptData.receiptDate}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                required
              />
            </div>
          </div>

          {/* Row 5: Payment Mode & Remarks */}
          <div className="form-row">
            <div className="form-group">
              <label>Payment Mode :</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  name="paymentMode"
                  value={receiptData.paymentMode}
                  onChange={(e) => {
                    handleInputChange(e);
                    handlePaymentModeInput(e.target.value);
                  }}
                  disabled={isFormDisabled}
                  placeholder="Type payment mode for suggestions"
                  autoComplete="off"
                  required
                />
                {showPaymentModeSuggestions && paymentModeSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {paymentModeSuggestions.map((mode, index) => (
                      <div
                        key={index}
                        className="autocomplete-item"
                        onClick={() => selectPaymentMode(mode)}
                      >
                        {mode}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group remarks-group">
              <label>Remarks if any :</label>
              <textarea
                name="remarks"
                value={receiptData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional remarks..."
                disabled={isFormDisabled}
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            type="submit" 
            className="btn btn-save"
            disabled={loading || !isValidMember || isFormDisabled || editingReceiptId}
          >
            {loading ? 'Processing...' : 'Add/Save'}
          </button>
          <button 
            type="button" 
            className="btn btn-update"
            onClick={handleUpdateReceipt}
            disabled={loading || !editingReceiptId || !isValidMember || isFormDisabled}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button 
            type="button" 
            className="btn btn-delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading || !editingReceiptId}
          >
            Delete
          </button>
          <button 
            type="button" 
            className="btn btn-exit"
            onClick={resetForm}
          >
            Exit
          </button>
        </div>
      </form>

      {/* Previous History Section */}
      {selectedMember && (
        <div className="previous-history-section">
          <h3>[ Previous History ]</h3>
          <div className="history-container">
            {memberReceiptHistory.length === 0 ? (
              <div className="no-history">
                <div className="no-history-icon">📝</div>
                <h4>No donation history</h4>
                <p>This member hasn't made any donations yet.</p>
              </div>
            ) : (
              <div className="history-table">
                <div className="history-header">
                  <div className="col-date">Receipt Date</div>
                  <div className="col-receipt">Receipt No.</div>
                  <div className="col-book">Book No.</div>
                  <div className="col-reg">Reg. No.</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-mode">Payment Mode</div>
                  <div className="col-payment-id">Payment ID</div>
                  <div className="col-remarks">Remarks</div>
                  <div className="col-actions">Actions</div>
                </div>
                {memberReceiptHistory.map((receipt, index) => (
                  <div key={receipt._id || index} className="history-row">
                    <div className="col-date">{formatDate(receipt.receiptDate)}</div>
                    <div className="col-receipt">{receipt.receiptNo}</div>
                    <div className="col-book">{receipt.bookNo || '-'}</div>
                    <div className="col-reg">{receipt.member?.regNo || '-'}</div>
                    <div className="col-amount">{formatCurrency(receipt.amount)}</div>
                    <div className="col-mode">{receipt.paymentMode}</div>
                    <div className="col-payment-id">{receipt.paymentId || '-'}</div>
                    <div className="col-remarks">{receipt.remarks || '-'}</div>
                    <div className="col-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditReceipt(receipt._id)}
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this receipt?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-confirm-delete"
                onClick={handleDeleteReceipt}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptEntry;
