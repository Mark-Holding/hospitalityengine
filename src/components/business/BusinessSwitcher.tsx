'use client';

import { useBusinessContext } from '@/contexts/BusinessContext';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function BusinessSwitcher() {
  const {
    activeBusiness,
    profile,
    switchBusiness,
    hasMultipleBusinesses,
    loading,
  } = useBusinessContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !activeBusiness) {
    return (
      <div className="px-3 py-2 bg-gray-100 rounded-md animate-pulse">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  // If only one business, just show the name (not clickable)
  if (!hasMultipleBusinesses) {
    return (
      <div className="px-3 py-2 text-sm font-medium text-gray-900">
        {activeBusiness.business.name}
      </div>
    );
  }

  // Multiple businesses - show dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {activeBusiness.business.name}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {activeBusiness.role}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Businesses
            </div>

            {profile?.businesses.map((business) => (
              <button
                key={business.business_id}
                onClick={() => {
                  switchBusiness(business.business_id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  business.business_id === activeBusiness.business_id
                    ? 'bg-blue-50 border-l-2 border-blue-600'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {business.business.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {business.role}
                    </div>
                  </div>
                  {business.business_id === activeBusiness.business_id && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}

            <div className="border-t border-gray-200 mt-1 pt-1">
              <Link
                href="/onboarding"
                className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Business
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
