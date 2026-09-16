import React from 'react';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  icon: React.ElementType;
  colorClass: string;
  iconColorClass: string;
}

export interface MarketPrice {
  grade: 'A' | 'B' | 'C';
  price: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface MarketData {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable' | 'grain';
  prices: MarketPrice[];
  lastYearPrice: number;
  currentPrice: number;
  futurePrice: number;
}