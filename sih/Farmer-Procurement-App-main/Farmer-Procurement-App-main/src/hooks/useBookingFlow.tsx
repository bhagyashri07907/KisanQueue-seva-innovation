import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingFlowState, Crop, ProcurementCenter, TimeSlot } from '../types';
import { DEMO_CROPS, DEMO_CENTERS } from '../data/mockData';

interface BookingFlowContextType {
  state: BookingFlowState;
  selectedCrop: Crop | undefined;
  selectedCenter: ProcurementCenter | undefined;
  setDistrict: (district: string, taluka?: string) => void;
  setCrop: (cropId: string) => void;
  setCenter: (centerId: string) => void;
  setDate: (date: string) => void;
  setTimeSlot: (slotId: string, timeWindow: string) => void;
  setQuantity: (quantity: number) => void;
  resetFlow: () => void;
}

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

const STORAGE_KEY = 'kq_booking_flow_state';

export const BookingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BookingFlowState>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectedCrop = DEMO_CROPS.find((c) => c.id === state.cropId);
  const selectedCenter = DEMO_CENTERS.find((c) => c.id === state.centerId) || (state.centerId ? {
    id: state.centerId,
    name: state.centerId === 'PC001' ? 'Government Procurement Center - Baramati' :
          state.centerId === 'PC002' ? 'Government Procurement Center - Karad' :
          state.centerId === 'PC003' ? 'Government Procurement Center - Niphad' :
          `Procurement Center (${state.centerId})`,
    nameHi: state.centerId === 'PC001' ? 'सरकारी खरीद केंद्र - बारामती' :
            state.centerId === 'PC002' ? 'सरकारी खरीद केंद्र - कराड' :
            state.centerId === 'PC003' ? 'सरकारी खरीद केंद्र - निफाड' :
            `खरीद केंद्र (${state.centerId})`,
    nameMr: state.centerId === 'PC001' ? 'शासकीय खरेदी केंद्र - बारामती' :
            state.centerId === 'PC002' ? 'शासकीय खरेदी केंद्र - कराड' :
            state.centerId === 'PC003' ? 'शासकीय खरेदी केंद्र - निफाड' :
            `खरेदी केंद्र (${state.centerId})`,
    location: state.district ? `${state.district}, Maharashtra` : 'Maharashtra',
    district: state.district || 'Pune',
    state: 'Maharashtra',
    acceptedCropIds: ['crop_soybean', 'crop_wheat', 'crop_gram', 'crop_cotton', 'crop_paddy', 'crop_maize'],
    capacityPerDayQuintals: 500,
    contactPhone: '+91 0000 000000',
    operatingHours: '09:00 - 17:00',
    status: 'Available' as const
  } : undefined);

  const setDistrict = (district: string, taluka?: string) => {
    setState((prev) => {
      // If center is in a different district, clear center selection
      const centerStillValid = prev.centerId
        ? DEMO_CENTERS.find((c) => c.id === prev.centerId)?.district.toLowerCase() === district.toLowerCase()
        : false;
      return {
        ...prev,
        district,
        taluka: taluka || prev.taluka,
        centerId: centerStillValid ? prev.centerId : undefined,
      };
    });
  };

  const setCrop = (cropId: string) => {
    setState((prev) => ({
      ...prev,
      cropId,
      // If previous center does not accept new crop, clear center
      centerId: prev.centerId && DEMO_CENTERS.find((c) => c.id === prev.centerId)?.acceptedCropIds.includes(cropId)
        ? prev.centerId
        : undefined,
    }));
  };

  const setCenter = (centerId: string) => {
    setState((prev) => ({ ...prev, centerId }));
  };

  const setDate = (date: string) => {
    setState((prev) => ({ ...prev, date, timeSlotId: undefined, timeSlotWindow: undefined }));
  };

  const setTimeSlot = (slotId: string, timeWindow: string) => {
    setState((prev) => ({ ...prev, timeSlotId: slotId, timeSlotWindow: timeWindow }));
  };

  const setQuantity = (quantity: number) => {
    setState((prev) => ({ ...prev, expectedQuantityQuintals: quantity }));
  };

  const resetFlow = () => {
    setState({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <BookingFlowContext.Provider
      value={{
        state,
        selectedCrop,
        selectedCenter,
        setDistrict,
        setCrop,
        setCenter,
        setDate,
        setTimeSlot,
        setQuantity,
        resetFlow,
      }}
    >
      {children}
    </BookingFlowContext.Provider>
  );
};

export const useBookingFlow = (): BookingFlowContextType => {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  }
  return context;
};
