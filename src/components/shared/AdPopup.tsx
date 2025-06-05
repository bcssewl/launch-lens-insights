
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, BarChart3, Brain, Zap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdPopup: React.FC<AdPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 border-0 bg-transparent shadow-none">
        <Card className="relative p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border/50 shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Like what you see?
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your own detailed business idea reports with AI-powered insights, market analysis, and actionable recommendations.
            </p>
            
            <div className="flex flex-col space-y-2 text-xs text-left">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Comprehensive market analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary flex-shrink-0" />
                <span>AI-powered business insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Actionable next steps</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="w-full">
                <Link to="/signup">
                  Start Your Free Analysis
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link to="/login">
                  Already have an account? Sign in
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AdPopup;
