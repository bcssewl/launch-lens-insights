import { useEffect } from 'react';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';

/**
 * Custom hook for DeerFlow keyboard navigation and shortcuts
 */
export const useDeerFlowKeyboard = () => {
  const { 
    researchPanelState,
    closeResearchPanel,
    switchResearchTab 
  } = useDeerFlowMessageStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key closes research panel
      if (event.key === 'Escape' && researchPanelState.isOpen) {
        event.preventDefault();
        closeResearchPanel();
        return;
      }

      // Tab navigation when panel is open
      if (researchPanelState.isOpen && event.key === 'Tab' && event.shiftKey === false) {
        // Custom tab navigation logic can be added here
        // For now, let browser handle default tab behavior
      }

      // Arrow keys for tab switching when panel is open and focused
      if (researchPanelState.isOpen && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const focusedElement = document.activeElement;
        const isInPanel = focusedElement?.closest('[role="dialog"]') || 
                         focusedElement?.closest('.research-panel');
        
        if (isInPanel) {
          event.preventDefault();
          const newTab = researchPanelState.activeTab === 'activities' ? 'report' : 'activities';
          switchResearchTab(newTab);
        }
      }

      // Alt + R to toggle research panel (when there's an active research)
      if (event.altKey && event.key === 'r' && researchPanelState.openResearchId) {
        event.preventDefault();
        if (researchPanelState.isOpen) {
          closeResearchPanel();
        } else {
          // Logic to reopen panel would go here
          // openResearchPanel(researchPanelState.openResearchId);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [researchPanelState, closeResearchPanel, switchResearchTab]);

  return {
    isResearchPanelOpen: researchPanelState.isOpen,
    activeTab: researchPanelState.activeTab
  };
};