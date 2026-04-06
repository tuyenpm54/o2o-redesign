import React from 'react';
import { 
  Utensils, Sparkles, CheckCircle2, Wallet, MoreHorizontal, Check, Clock, Users, BellRing,
  Coffee, CupSoda, Wine, IceCream, ChefHat, MessageSquare, AlertCircle, ShoppingBag, 
  HelpCircle, Trash2, Heart, Star, ThumbsUp, Pizza
} from 'lucide-react';

export const IconDictionary: Record<string, React.ElementType> = {
  Utensils,
  Sparkles,
  CheckCircle2,
  Wallet,
  MoreHorizontal,
  Check,
  Clock,
  Users,
  BellRing,
  Coffee,
  CupSoda,
  Wine,
  IceCream,
  ChefHat,
  MessageSquare,
  AlertCircle,
  ShoppingBag,
  HelpCircle,
  Trash2,
  Heart,
  Star,
  ThumbsUp,
  Pizza
};

export const getIconComponent = (iconName: string): React.ElementType => {
  return IconDictionary[iconName] || HelpCircle;
};
