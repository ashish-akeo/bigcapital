import React, { createContext, useContext, ReactNode } from 'react';
import {
  GetInvoicePaymentLinkResponse,
  useGetInvoicePaymentLink,
} from '@/hooks/query/payment-link';
import { Spinner } from '@blueprintjs/core';
import { useInvoice } from '@/hooks/query';

interface PaymentPortalContextType {
  linkId: string;
  sharableLinkMeta: GetInvoicePaymentLinkResponse | undefined;
  isSharableLinkMetaLoading: boolean;
  discountAmount : string | undefined | null;
}

const PaymentPortalContext = createContext<PaymentPortalContextType>(
  {} as PaymentPortalContextType,
);

interface PaymentPortalBootProps {
  linkId: string;
  children: ReactNode;
}

export const PaymentPortalBoot: React.FC<PaymentPortalBootProps> = ({
  linkId,
  children,
}) => {
  const { data: sharableLinkMeta, isLoading: isSharableLinkMetaLoading } =
    useGetInvoicePaymentLink(linkId);
  
  // Extract the Invoice ID from the invoice number (e.g., "INV-00001" → 00001)
  const invoiceId = sharableLinkMeta?.invoiceNo
    ?.match(/\d+/g)
    ?.pop();

  // Fetch sale invoice details.
  const { data: invoice, isLoading: isInvoiceLoading } = 
    useInvoice(invoiceId, { 
      enabled: !!invoiceId 
    }, {});
  
  const value = {
    linkId,
    sharableLinkMeta,
    isSharableLinkMetaLoading,
    discountAmount : invoice?.discount_amount_formatted
  };

  if (isSharableLinkMetaLoading || isInvoiceLoading) {
    return <Spinner size={20} />;
  }

  return (
    <PaymentPortalContext.Provider value={value}>
      {children}
    </PaymentPortalContext.Provider>
  );
};

export const usePaymentPortalBoot = (): PaymentPortalContextType => {
  const context = useContext(PaymentPortalContext);

  if (!context) {
    throw new Error(
      'usePaymentPortal must be used within a PaymentPortalProvider',
    );
  }
  return context;
};
