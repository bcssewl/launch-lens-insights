import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from '@/components/icons';
import { UserCircle, Settings as SettingsIcon, LogOut, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const TopHeader: React.FC = () => {
  const {
    user,
    signOut
  } = useAuth();
  const handleLogout = async () => {
    await signOut();
  };
  return;
};
export default TopHeader;