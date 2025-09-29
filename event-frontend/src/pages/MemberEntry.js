import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';
import { citiesByCountry } from '../data/citiesData';
import './MemberEntry.css';

const MemberEntry = () => {
  const [formData, setFormData] = useState({
    regNo: '',
    daniMemberNo: '',
    memberName: '',
    fatherHusbandName: '',
    address: {
      add1: '',
      add2: '',
      add3: '',
      city: '',
      pinCode: '',
      state: '',
      country: 'India'
    },
    contact: {
      mob1: '',
      mobNo2: '',
      emailId: ''
    },
    identification: {
      panNo: '',
      aadharNo: '',
      otherIdType: '',
      otherIdValue: ''
    },
    personal: {
      occupation: '',
      qualification: '',
      dateOfBirth: '',
      anniversaryDate: ''
    },
    spiritual: {
      dikshaPlace: '',
      dikshaDate: ''
    },
    additional: {
      remarks: '',
      activity: '',
      gift: ''
    },
    membership: {
      regAmount: 0,
      cardClass: '',
      issueDate: '',
      validity: ''
    }
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Indian States Data
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];


  // Countries Data
  const countries = [
    'India', 'United States', 'China', 'Japan', 'Germany', 'United Kingdom', 'France',
    'Italy', 'Brazil', 'Canada', 'Australia', 'South Korea', 'Spain', 'Mexico',
    'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Taiwan', 'Switzerland',
    'Belgium', 'Argentina', 'Ireland', 'Israel', 'Austria', 'Nigeria', 'Norway',
    'United Arab Emirates', 'South Africa', 'Thailand', 'Bangladesh', 'Vietnam',
    'Malaysia', 'Philippines', 'Singapore', 'Denmark', 'Hong Kong', 'Egypt',
    'Chile', 'Finland', 'Pakistan', 'Romania', 'Czech Republic', 'New Zealand',
    'Peru', 'Iraq', 'Portugal', 'Greece', 'Qatar', 'Algeria', 'Kazakhstan',
    'Hungary', 'Kuwait', 'Ukraine', 'Morocco', 'Ecuador', 'Ethiopia', 'Angola',
    'Sudan', 'Oman', 'Azerbaijan', 'Belarus', 'Sri Lanka', 'Myanmar', 'Tanzania',
    'Kenya', 'Uzbekistan', 'Ghana', 'Yemen', 'Nepal', 'Venezuela', 'Madagascar',
    'Cameroon', 'Côte d\'Ivoire', 'North Korea', 'Australia', 'Syria', 'Mali',
    'Burkina Faso', 'Malawi', 'Zambia', 'Somalia', 'Senegal', 'Chad', 'Zimbabwe',
    'Guinea', 'Rwanda', 'Benin', 'Burundi', 'Tunisia', 'South Sudan', 'Togo',
    'Sierra Leone', 'Libya', 'Liberia', 'Central African Republic', 'Mauritania',
    'Eritrea', 'Gambia', 'Botswana', 'Namibia', 'Gabon', 'Lesotho', 'Guinea-Bissau',
    'Equatorial Guinea', 'Mauritius', 'Eswatini', 'Djibouti', 'Fiji', 'Comoros',
    'Guyana', 'Bhutan', 'Solomon Islands', 'Montenegro', 'Luxembourg', 'Suriname',
    'Cape Verde', 'Micronesia', 'Malta', 'Brunei', 'Belize', 'Bahamas', 'Maldives',
    'Iceland', 'Vanuatu', 'Barbados', 'Sao Tome and Principe', 'Samoa', 'Saint Lucia',
    'Kiribati', 'Grenada', 'Tonga', 'Seychelles', 'Antigua and Barbuda', 'Andorra',
    'Dominica', 'Marshall Islands', 'Saint Kitts and Nevis', 'Liechtenstein',
    'Monaco', 'San Marino', 'Palau', 'Tuvalu', 'Nauru', 'Vatican City'
  ];

  // Country codes for mobile numbers
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+244', country: 'Angola', flag: '🇦🇴' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+850', country: 'North Korea', flag: '🇰🇵' },
    { code: '+963', country: 'Syria', flag: '🇸🇾' },
    { code: '+223', country: 'Mali', flag: '🇲🇱' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+252', country: 'Somalia', flag: '🇸🇴' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳' },
    { code: '+235', country: 'Chad', flag: '🇹🇩' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+224', country: 'Guinea', flag: '🇬🇳' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+229', country: 'Benin', flag: '🇧🇯' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
    { code: '+228', country: 'Togo', flag: '🇹🇬' },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+218', country: 'Libya', flag: '🇱🇾' },
    { code: '+231', country: 'Liberia', flag: '🇱🇷' },
    { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
    { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
    { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
    { code: '+220', country: 'Gambia', flag: '🇬🇲' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼' },
    { code: '+264', country: 'Namibia', flag: '🇳🇦' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
    { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯' },
    { code: '+269', country: 'Comoros', flag: '🇰🇲' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
    { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷' },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
    { code: '+356', country: 'Malta', flag: '🇲🇹' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳' },
    { code: '+501', country: 'Belize', flag: '🇧🇿' },
    { code: '+1242', country: 'Bahamas', flag: '🇧🇸' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
    { code: '+1246', country: 'Barbados', flag: '🇧🇧' },
    { code: '+239', country: 'Sao Tome and Principe', flag: '🇸🇹' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+1758', country: 'Saint Lucia', flag: '🇱🇨' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
    { code: '+1473', country: 'Grenada', flag: '🇬🇩' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
    { code: '+1268', country: 'Antigua and Barbuda', flag: '🇦🇬' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩' },
    { code: '+1767', country: 'Dominica', flag: '🇩🇲' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+1869', country: 'Saint Kitts and Nevis', flag: '🇰🇳' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲' },
    { code: '+680', country: 'Palau', flag: '🇵🇼' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
    { code: '+674', country: 'Nauru', flag: '🇳🇷' },
    { code: '+379', country: 'Vatican City', flag: '🇻🇦' }
  ];

  // Other ID Types
  const otherIdTypes = [
    'Passport',
    'Driving License',
    'Voter ID'
  ];

  // Qualification Options
  const qualificationOptions = [
    'Below 10th',
    '10th Pass (Secondary School/Matriculation)',
    '12th Pass (Higher Secondary/Intermediate)',
    'Under-graduate',
    'Postgraduate',
    'Doctoral & Professional'
  ];

  // Validation functions
  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAadhar = (aadhar) => {
    const cleanAadhar = aadhar.replace(/\s/g, '');
    const aadharRegex = /^[0-9]{12}$/;
    return aadharRegex.test(cleanAadhar);
  };

  const validateMobile = (mobile) => {
    // Remove all non-digit characters
    const cleanMobile = mobile.replace(/\D/g, '');
    // Check if it's exactly 10 digits and starts with 6, 7, 8, or 9 (valid Indian mobile prefixes)
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(cleanMobile);
  };

  // Format PAN number
  const formatPAN = (value) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    let formatted = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Limit to 10 characters
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    return formatted;
  };

  // Format Aadhar number
  const formatAadhar = (value) => {
    // Remove all non-digit characters
    let formatted = value.replace(/\D/g, '');
    
    // Limit to 12 digits
    if (formatted.length > 12) {
      formatted = formatted.substring(0, 12);
    }
    
    // Add spaces every 4 digits
    if (formatted.length > 4) {
      formatted = formatted.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    } else if (formatted.length > 8) {
      formatted = formatted.replace(/(\d{4})(\d{4})/, '$1 $2');
    }
    
    return formatted;
  };

  // Format mobile number
  const formatMobile = (value) => {
    // Remove all non-digit characters
    let formatted = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    return formatted;
  };


  // Auto-complete functions
  const handleCityInput = (value) => {
    if (value.length > 0) {
      // Get cities based on selected country
      const selectedCountry = formData.address.country || 'India';
      const availableCities = citiesByCountry[selectedCountry] || citiesByCountry['India'];
      
      const filtered = availableCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setCitySuggestions(filtered);
      setShowCitySuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const handleCountryInput = (value) => {
    if (value.length > 0) {
      const filtered = countries.filter(country =>
        country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setCountrySuggestions(filtered);
      setShowCountrySuggestions(true);
    } else {
      setCountrySuggestions([]);
      setShowCountrySuggestions(false);
    }
  };

  const selectCity = (city) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: city
      }
    }));
    setShowCitySuggestions(false);
  };

  const selectCountry = (country) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        country: country,
        city: '' // Clear city when country changes
      }
    }));
    setShowCountrySuggestions(false);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  };

  // Function to fetch next registration number
  const fetchNextRegNo = useCallback(async () => {
    try {
      const response = await API.get('/members/next-reg-no');
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          regNo: response.data.data.nextRegNo
        }));
      }
    } catch (error) {
      console.error('Error getting next reg number:', error);
    }
  }, []);

  // Function to fetch member by Dani Member Number
  const fetchMemberByDaniNumber = useCallback(async (daniMemberNo) => {
    if (!daniMemberNo.trim()) {
      setIsEditMode(false);
      // When clearing Dani Member Number, fetch next available reg number
      await fetchNextRegNo();
      return;
    }

    setIsLoadingMember(true);
    try {
      const response = await API.get(`/members/dani/${daniMemberNo}`);
      if (response.data.success && response.data.data) {
        const member = response.data.data;
        // Helper function to format date for HTML date input
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
          } catch (error) {
            console.error('Error formatting date:', error);
            return '';
          }
        };

        setFormData(prev => ({
          ...prev,
          regNo: member.regNo || prev.regNo,
          daniMemberNo: member.daniMemberNo || daniMemberNo,
          memberName: member.memberName || '',
          fatherHusbandName: member.fatherHusbandName || '',
          address: {
            add1: member.address?.add1 || '',
            add2: member.address?.add2 || '',
            add3: member.address?.add3 || '',
            city: member.address?.city || '',
            pinCode: member.address?.pinCode || '',
            state: member.address?.state || '',
            country: member.address?.country || 'India'
          },
          contact: {
            mob1: member.contact?.mob1 || '',
            mobNo2: member.contact?.mobNo2 || '',
            emailId: member.contact?.emailId || ''
          },
          identification: {
            panNo: member.identification?.panNo || '',
            aadharNo: member.identification?.aadharNo || '',
            otherIdType: member.identification?.otherIdType || '',
            otherIdValue: member.identification?.otherIdValue || ''
          },
          personal: {
            occupation: member.personal?.occupation || '',
            qualification: member.personal?.qualification || '',
            dateOfBirth: formatDateForInput(member.personal?.dateOfBirth),
            anniversaryDate: formatDateForInput(member.personal?.anniversaryDate)
          },
          spiritual: {
            dikshaPlace: member.spiritual?.dikshaPlace || '',
            dikshaDate: formatDateForInput(member.spiritual?.dikshaDate)
          },
          additional: {
            remarks: member.additional?.remarks || '',
            activity: member.additional?.activity || 'Select',
            gift: member.additional?.gift || ''
          },
          membership: {
            regAmount: member.membership?.regAmount || 0,
            cardClass: member.membership?.cardClass || '',
            issueDate: formatDateForInput(member.membership?.issueDate),
            validity: formatDateForInput(member.membership?.validity)
          }
        }));
        setIsEditMode(true);
        toast.success('Member data loaded successfully!');
      } else {
        // Member not found - ensure form is cleared for new entry
        setFormData(prev => ({
          regNo: '', // Clear the registration number
          daniMemberNo: daniMemberNo, // Keep the entered Dani Member Number
          memberName: '',
          fatherHusbandName: '',
          address: {
            add1: '',
            add2: '',
            add3: '',
            city: '',
            pinCode: '',
            state: '',
            country: 'India'
          },
          contact: {
            mob1: '',
            mobNo2: '',
            emailId: ''
          },
          identification: {
            panNo: '',
            aadharNo: '',
            otherIdType: '',
            otherIdValue: ''
          },
          personal: {
            occupation: '',
            qualification: '',
            dateOfBirth: '',
            anniversaryDate: ''
          },
          spiritual: {
            dikshaPlace: '',
            dikshaDate: ''
          },
          additional: {
            remarks: '',
            activity: '',
            gift: ''
          },
          membership: {
            regAmount: 0,
            cardClass: '',
            issueDate: '',
            validity: ''
          }
        }));
        setIsEditMode(false);
        
        // Fetch next available registration number for new entry
        await fetchNextRegNo();
        
        toast.info('New member - please fill in the details');
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      // On error, also clear form for new entry
      setFormData(prev => ({
        regNo: '', // Clear the registration number
        daniMemberNo: daniMemberNo, // Keep the entered Dani Member Number
        memberName: '',
        fatherHusbandName: '',
        address: {
          add1: '',
          add2: '',
          add3: '',
          city: '',
          pinCode: '',
          state: '',
          country: 'India'
        },
        contact: {
          mob1: '',
          mobNo2: '',
          emailId: ''
        },
        identification: {
          panNo: '',
          aadharNo: '',
          otherIdType: '',
          otherIdValue: ''
        },
        personal: {
          occupation: '',
          qualification: '',
          dateOfBirth: '',
          anniversaryDate: ''
        },
        spiritual: {
          dikshaPlace: '',
          dikshaDate: ''
        },
        additional: {
          remarks: '',
          activity: 'Select',
          gift: ''
        },
        membership: {
          regAmount: 0,
          cardClass: '',
          issueDate: '',
          validity: ''
        }
      }));
      setIsEditMode(false);
      
      // Fetch next available registration number for new entry
      await fetchNextRegNo();
      
      toast.info('New member - please fill in the details');
    } finally {
      setIsLoadingMember(false);
    }
  }, [fetchNextRegNo]);

  // Check authentication and get next reg number
  useEffect(() => {
    // Authentication is now handled by HttpOnly cookies and API interceptor
    // No need to check localStorage token

    // Handle pre-filled member data from MemberList
    if (location.state?.prefillDaniMemberNo) {
      // Fetch the member data and populate the form
      fetchMemberByDaniNumber(location.state.prefillDaniMemberNo);
    } else {
      // Always get next registration number for display (even for new entries)
      fetchNextRegNo();
    }
  }, [navigate, location.state, fetchMemberByDaniNumber, fetchNextRegNo]);

  // Close auto-complete dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowCitySuggestions(false);
        setShowCountrySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let newValidationErrors = { ...validationErrors };
    
    // Handle Dani Member Number input with debounced search
    if (name === 'daniMemberNo') {
      // If we're in edit mode and the Dani Member Number is changing,
      // immediately clear all other fields to prepare for new entry
      if (isEditMode && value !== formData.daniMemberNo) {
        setFormData(prev => ({
          regNo: '', // Clear the old registration number
          daniMemberNo: value, // Set the new Dani Member Number
          memberName: '',
          fatherHusbandName: '',
          address: {
            add1: '',
            add2: '',
            add3: '',
            city: '',
            pinCode: '',
            state: '',
            country: 'India'
          },
          contact: {
            mob1: '',
            mobNo2: '',
            emailId: ''
          },
          identification: {
            panNo: '',
            aadharNo: '',
            otherIdType: '',
            otherIdValue: ''
          },
          personal: {
            occupation: '',
            qualification: '',
            dateOfBirth: '',
            anniversaryDate: ''
          },
          spiritual: {
            dikshaPlace: '',
            dikshaDate: ''
          },
          additional: {
            remarks: '',
            activity: '',
            gift: ''
          },
          membership: {
            regAmount: 0,
            cardClass: '',
            issueDate: '',
            validity: ''
          }
        }));
        setIsEditMode(false); // Switch to create mode
        
        // Fetch next available registration number for new entry
        await fetchNextRegNo();
        
        toast.info('Dani Member Number changed. Form cleared for new entry.');
      } else {
        // If not in edit mode, just update the Dani Member Number
        setFormData(prev => ({
          ...prev,
          daniMemberNo: value
        }));
      }
      
      // Debounce the member fetch
      if (value.trim()) {
        const timeoutId = setTimeout(() => {
          fetchMemberByDaniNumber(value.trim());
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      } else {
        setIsEditMode(false);
      }
      return;
    }
    
    // Handle PAN number formatting and validation
    if (name === 'identification.panNo') {
      formattedValue = formatPAN(value);
      if (formattedValue.length === 10) {
        if (validatePAN(formattedValue)) {
          delete newValidationErrors.panNo;
        } else {
          newValidationErrors.panNo = 'Invalid PAN format. Should be ABCDE1234F';
        }
      } else if (formattedValue.length > 0) {
        newValidationErrors.panNo = 'PAN must be 10 characters (5 letters + 4 digits + 1 letter)';
      } else {
        delete newValidationErrors.panNo;
      }
    }
    
    // Handle Aadhar number formatting and validation
    if (name === 'identification.aadharNo') {
      formattedValue = formatAadhar(value);
      const cleanAadhar = formattedValue.replace(/\s/g, '');
      if (cleanAadhar.length === 12) {
        if (validateAadhar(formattedValue)) {
          delete newValidationErrors.aadharNo;
        } else {
          newValidationErrors.aadharNo = 'Invalid Aadhar format. Should be 12 digits';
        }
      } else if (cleanAadhar.length > 0) {
        newValidationErrors.aadharNo = 'Aadhar must be 12 digits';
      } else {
        delete newValidationErrors.aadharNo;
      }
    }
    
    // Handle mobile number formatting and validation
    if (name === 'contact.mob1' || name === 'contact.mobNo2') {
      formattedValue = formatMobile(value);
      if (formattedValue.length === 10) {
        if (validateMobile(formattedValue)) {
          delete newValidationErrors[name.split('.')[1]];
        } else {
          newValidationErrors[name.split('.')[1]] = 'Invalid mobile number. Must start with 6, 7, 8, or 9';
        }
      } else if (formattedValue.length > 0) {
        newValidationErrors[name.split('.')[1]] = 'Mobile number must be exactly 10 digits';
      } else {
        delete newValidationErrors[name.split('.')[1]];
      }
    }
    
    setValidationErrors(newValidationErrors);
    
    // Handle city auto-complete
    if (name === 'address.city') {
      handleCityInput(formattedValue);
    }
    
    // Handle country auto-complete
    if (name === 'address.country') {
      handleCountryInput(formattedValue);
    }
    
    // Handle nested object fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  // Function to fetch city and state from pincode
  const fetchLocationFromPincode = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              city: postOffice.District || '',
              state: postOffice.State || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }
  };

  // Handle pincode change with debouncing
  const handlePincodeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        pinCode: value
      }
    }));

    // Debounce the API call
    if (value.length === 6) {
      setTimeout(() => {
        fetchLocationFromPincode(value);
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields - only these three are mandatory
    const requiredFields = {
      daniMemberNo: 'Dani Member Number',
      memberName: 'Member Name',
      'address.city': 'City'
    };
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!formData[parent]?.[child]?.trim()) {
          missingFields.push(label);
        }
      } else {
        if (!formData[field]?.trim()) {
          missingFields.push(label);
        }
      }
    }
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate PAN, Aadhar, and Mobile numbers before submission
    const newValidationErrors = {};
    
    if (formData.identification.panNo && !validatePAN(formData.identification.panNo)) {
      newValidationErrors.panNo = 'Invalid PAN format. Should be ABCDE1234F';
    }
    
    if (formData.identification.aadharNo && !validateAadhar(formData.identification.aadharNo)) {
      newValidationErrors.aadharNo = 'Invalid Aadhar format. Should be 12 digits';
    }
    
    // Validate primary mobile number (optional)
    if (formData.contact.mob1 && !validateMobile(formData.contact.mob1)) {
      newValidationErrors.mob1 = 'Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9';
    }
    
    // Validate secondary mobile number (optional)
    if (formData.contact.mobNo2 && !validateMobile(formData.contact.mobNo2)) {
      newValidationErrors.mobNo2 = 'Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9';
    }
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare data for submission - clean up identification fields and remove regNo
      const { regNo, ...formDataWithoutRegNo } = formData;
      const submitData = {
        ...formDataWithoutRegNo,
        identification: {
          ...formData.identification,
          panNo: formData.identification.panNo ? formData.identification.panNo.toUpperCase() : '',
          aadharNo: formData.identification.aadharNo ? formData.identification.aadharNo.replace(/\s/g, '') : ''
        }
      };
      
      // Debug: Log the data being sent
      console.log('Submitting member data:', submitData);
      
      let response;
      if (isEditMode) {
        // Update existing member
        response = await API.put(`/members/dani/${formData.daniMemberNo}`, submitData);
        if (response.data.success) {
          toast.success('Member updated successfully!');
        }
      } else {
        // Create new member
        response = await API.post('/members', submitData);
        if (response.data.success) {
          toast.success('Member created successfully!');
        }
      }
      
      if (response.data.success) {
        // Reset form for new entry
        setFormData(prev => ({
          ...prev,
          regNo: prev.regNo, // Keep the current registration number
          daniMemberNo: '',
          memberName: '',
          fatherHusbandName: '',
          address: {
            add1: '',
            add2: '',
            add3: '',
            city: '',
            pinCode: '',
            state: '',
            country: 'India'
          },
          contact: {
            mob1: '',
            mobNo2: '',
            emailId: ''
          },
          identification: {
            panNo: '',
            aadharNo: '',
            otherIdType: '',
            otherIdValue: ''
          },
          personal: {
            occupation: '',
            qualification: '',
            dateOfBirth: '',
            anniversaryDate: ''
          },
          spiritual: {
            dikshaPlace: '',
            dikshaDate: ''
          },
          additional: {
            remarks: '',
            activity: '',
            gift: ''
          },
          membership: {
            regAmount: 0,
            cardClass: '',
            issueDate: '',
            validity: ''
          }
        }));
        setIsEditMode(false);
      } else {
        toast.error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} member`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} member:`, error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} member. Please try again.`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    // Reset form to initial state for new entry
    setFormData(prev => ({
      regNo: prev.regNo, // Keep the current registration number
      daniMemberNo: '', // Clear Dani Member Number
      memberName: '',
      fatherHusbandName: '',
      address: {
        add1: '',
        add2: '',
        add3: '',
        city: '',
        pinCode: '',
        state: '',
        country: 'India'
      },
      contact: {
        mob1: '',
        mobNo2: '',
        emailId: ''
      },
      identification: {
        panNo: '',
        aadharNo: '',
        otherIdType: '',
        otherIdValue: ''
      },
      personal: {
        occupation: '',
        qualification: '',
        dateOfBirth: '',
        anniversaryDate: ''
      },
      spiritual: {
        dikshaPlace: '',
        dikshaDate: ''
      },
      additional: {
        remarks: '',
        activity: 'Select',
        gift: ''
      },
      membership: {
        regAmount: 0,
        cardClass: '',
        issueDate: '',
        validity: ''
      }
    }));
    setValidationErrors({});
    setIsEditMode(false);
    toast.info('Form refreshed for new entry');
  };

  return (
    <div className="member-entry-container">
      <div className="form-header">
        <div className="header-left">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
              marginRight: '10px'
            }}
          >
            ← Back to Dashboard
          </button>
          Member Entry :::
        </div>
        <div className="header-center">Dani Sahyogi</div>
        <div className="header-right">
          Reg. Date : {new Date().toLocaleDateString('en-IN')}
          <span className="dropdown-arrow">▼</span>
          <button 
            type="button"
            className="view-members-btn"
            onClick={() => navigate('/member-list')}
            style={{
              marginLeft: '20px',
              padding: '8px 16px',
              background: '#4facfe',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📋 View Members
          </button>
        </div>
      </div>

      <form className="member-form" onSubmit={handleSubmit}>
        {/* Unified Form Container */}
        <div className="unified-form-container">
          {/* Row 1: Registration and Basic Information */}
          <div className="form-row">
            <div className="form-group">
              <label>Reg. No. :</label>
              <input 
                type="text" 
                name="regNo" 
                value={formData.regNo || ''}
                readOnly
                placeholder="Auto-generated by system"
                style={{ backgroundColor: '#f5f5f5', color: '#666' }}
              />
            </div>
            <div className="form-group">
              <label>Dani Member No. : <span className="required-asterisk">*</span></label>
              <input 
                type="text" 
                name="daniMemberNo" 
                value={formData.daniMemberNo}
                onChange={handleInputChange}
                placeholder="Enter Dani Member Number (e.g., DS-0001)"
                required
                disabled={isLoadingMember}
              />
              {isLoadingMember && (
                <span className="loading-indicator">🔍 Searching...</span>
              )}
            </div>
            <div className="form-group">
              <label>Member Name : <span className="required-asterisk">*</span></label>
              <input 
                type="text" 
                name="memberName" 
                value={formData.memberName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                maxLength="50"
                required
              />
            </div>
            <div className="form-group">
              <label>F/H/D/S of Name :</label>
              <input 
                type="text" 
                name="fatherHusbandName" 
                value={formData.fatherHusbandName}
                onChange={handleInputChange}
                placeholder="Father/Husband/Daughter/Son name"
                maxLength="50"
              />
            </div>
            <button type="button" className="refresh-btn" onClick={handleRefresh}>
              Refresh
            </button>
          </div>

          {/* Row 2: Address Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Add1 :</label>
              <input 
                type="text" 
                name="address.add1" 
                value={formData.address.add1}
                onChange={handleInputChange}
                placeholder="House/Flat No., Building Name"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Add2 :</label>
              <input 
                type="text" 
                name="address.add2" 
                value={formData.address.add2}
                onChange={handleInputChange}
                placeholder="Street, Area, Locality"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Add3 :</label>
              <input 
                type="text" 
                name="address.add3" 
                value={formData.address.add3}
                onChange={handleInputChange}
                placeholder="Landmark (optional)"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>City : <span className="required-asterisk">*</span></label>
              <div className="autocomplete-container">
                <input 
                  type="text" 
                  name="address.city" 
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder={`Type city name for ${formData.address.country || 'India'} suggestions`}
                  autoComplete="off"
                  maxLength="50"
                  required
                />
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {citySuggestions.map((city, index) => (
                      <div
                        key={index}
                        className="autocomplete-item"
                        onClick={() => selectCity(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Pin Code :</label>
              <input 
                type="text" 
                name="address.pinCode" 
                value={formData.address.pinCode}
                onChange={handlePincodeChange}
                maxLength="6"
                placeholder="Enter 6-digit pincode"
              />
            </div>
          </div>

          {/* Row 3: State, Country, and Contact */}
          <div className="form-row">
            <div className="form-group">
              <label>State :</label>
              <select 
                name="address.state" 
                value={formData.address.state}
                onChange={handleInputChange}
              >
                <option value="">Select State</option>
                {indianStates.map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Country :</label>
              <div className="autocomplete-container">
                <input 
                  type="text" 
                  name="address.country" 
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Type country name for suggestions"
                  autoComplete="off"
                  maxLength="50"
                />
                {showCountrySuggestions && countrySuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {countrySuggestions.map((country, index) => (
                      <div
                        key={index}
                        className="autocomplete-item"
                        onClick={() => selectCountry(country)}
                      >
                        {country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Mob.1 :</label>
              <div className="mobile-input-container">
                <select 
                  className="country-code-select"
                  defaultValue="+91"
                >
                  {countryCodes.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  name="contact.mob1" 
                  value={formData.contact.mob1}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className={`mobile-number-input ${validationErrors.mob1 ? 'error' : ''}`}
                />
              </div>
              {validationErrors.mob1 && (
                <span className="error-message">{validationErrors.mob1}</span>
              )}
            </div>
            <div className="form-group">
              <label>Mob.No.2 :</label>
              <div className="mobile-input-container">
                <select 
                  className="country-code-select"
                  defaultValue="+91"
                >
                  {countryCodes.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  name="contact.mobNo2" 
                  value={formData.contact.mobNo2}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number (optional)"
                  maxLength="10"
                  className={`mobile-number-input ${validationErrors.mobNo2 ? 'error' : ''}`}
                />
              </div>
              {validationErrors.mobNo2 && (
                <span className="error-message">{validationErrors.mobNo2}</span>
              )}
            </div>
            <div className="form-group">
              <label>E-mail Id :</label>
              <input 
                type="email" 
                name="contact.emailId" 
                value={formData.contact.emailId}
                onChange={handleInputChange}
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Row 4: Identification Details */}
          <div className="form-row">
            <div className="form-group">
              <label>PAN No. :</label>
              <input 
                type="text" 
                name="identification.panNo" 
                value={formData.identification.panNo}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                maxLength="10"
                className={validationErrors.panNo ? 'error' : ''}
              />
              {validationErrors.panNo && (
                <span className="error-message">{validationErrors.panNo}</span>
              )}
            </div>
            <div className="form-group">
              <label>Aadhar No. :</label>
              <input 
                type="text" 
                name="identification.aadharNo" 
                value={formData.identification.aadharNo}
                onChange={handleInputChange}
                placeholder="1234 5678 9012"
                maxLength="14"
                className={validationErrors.aadharNo ? 'error' : ''}
              />
              {validationErrors.aadharNo && (
                <span className="error-message">{validationErrors.aadharNo}</span>
              )}
            </div>
            <div className="form-group">
              <label>Other ID Type :</label>
              <select 
                name="identification.otherIdType" 
                value={formData.identification.otherIdType}
                onChange={handleInputChange}
              >
                <option value="">Select ID Type</option>
                {otherIdTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {formData.identification.otherIdType && (
              <div className="form-group">
                <label>{formData.identification.otherIdType} Number :</label>
                <input 
                  type="text" 
                  name="identification.otherIdValue" 
                  value={formData.identification.otherIdValue}
                  onChange={handleInputChange}
                  placeholder={`Enter ${formData.identification.otherIdType} number`}
                  maxLength="50"
                />
              </div>
            )}
            <div className="form-group">
              <label>Occupation :</label>
              <input 
                type="text" 
                name="personal.occupation" 
                value={formData.personal.occupation}
                onChange={handleInputChange}
                placeholder="e.g., Engineer, Teacher, Business"
                maxLength="50"
              />
            </div>
          </div>

          {/* Row 5: Qualification and Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Qualification :</label>
              <select 
                name="personal.qualification" 
                value={formData.personal.qualification}
                onChange={handleInputChange}
              >
                <option value="">Select Qualification</option>
                {qualificationOptions.map((qual, index) => (
                  <option key={index} value={qual}>{qual}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth :</label>
              <input 
                type="date" 
                name="personal.dateOfBirth" 
                value={formData.personal.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>M.Anniversary Date :</label>
              <input 
                type="date" 
                name="personal.anniversaryDate" 
                value={formData.personal.anniversaryDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group highlighted">
              <label>Diksha Place :</label>
              <input 
                type="text" 
                name="spiritual.dikshaPlace" 
                value={formData.spiritual.dikshaPlace}
                onChange={handleInputChange}
                className="highlighted-input"
                placeholder="Enter diksha place"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Diksha Date :</label>
              <input 
                type="date" 
                name="spiritual.dikshaDate" 
                value={formData.spiritual.dikshaDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Row 6: Membership and Additional Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Reg. Amount :</label>
              <input 
                type="number" 
                step="0.01"
                name="membership.regAmount" 
                value={formData.membership.regAmount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Card Class :</label>
              <input 
                type="text" 
                name="membership.cardClass" 
                value={formData.membership.cardClass}
                onChange={handleInputChange}
                placeholder="e.g., Gold, Silver, Bronze"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Issue Date :</label>
              <input 
                type="date" 
                name="membership.issueDate" 
                value={formData.membership.issueDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Validity :</label>
              <input 
                type="date" 
                name="membership.validity" 
                value={formData.membership.validity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Activity :</label>
              <input 
                type="text" 
                name="additional.activity" 
                value={formData.additional.activity}
                onChange={handleInputChange}
                placeholder="Enter activity status (e.g., Active, Inactive)"
                maxLength="50"
              />
            </div>
          </div>

          {/* Row 7: Gift and Remarks */}
          <div className="form-row">
            <div className="form-group">
              <label>Gift ? :</label>
              <input 
                type="text" 
                name="additional.gift" 
                value={formData.additional.gift}
                onChange={handleInputChange}
                placeholder="Gift details (optional)"
                maxLength="50"
              />
            </div>
            <div className="form-group remarks-group">
              <label>Remarks :</label>
              <textarea 
                name="additional.remarks" 
                value={formData.additional.remarks}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes or remarks"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button type="submit" className="btn btn-save" disabled={loading || isLoadingMember}>
            {loading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Add/Save")}
          </button>
          <button type="button" className="btn btn-delete">Delete</button>
          <button type="button" className="btn btn-exit">Exit</button>
        </div>
      </form>
    </div>
  );
};

export default MemberEntry;
