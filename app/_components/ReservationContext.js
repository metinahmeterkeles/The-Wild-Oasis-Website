'use client';

import { createContext, useContext, useState } from 'react';

const ReservationContent = createContext();

const initialState = { from: undefined, to: undefined };

function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState);

  const resetRange = () => setRange(initialState);

  return (
    <ReservationContent.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContent.Provider>
  );
}

function useReservation() {
  const context = useContext(ReservationContent);

  if (context === undefined)
    throw new Error('Context was used outside provider');

  return context;
}

export { ReservationProvider, useReservation };
