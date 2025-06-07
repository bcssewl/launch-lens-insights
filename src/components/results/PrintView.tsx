
import React from 'react';
import EnhancedPrintView from './EnhancedPrintView';
import type { PrintViewProps } from './print/types';

const PrintView: React.FC<PrintViewProps> = (props) => {
  return <EnhancedPrintView {...props} />;
};

export default PrintView;
