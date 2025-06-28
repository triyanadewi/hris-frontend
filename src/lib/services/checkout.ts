import api from '../api';

export interface CreateOrderData {
  package_benefits_id: number;
  add_branch: number;
  add_employees: number;
  company_name: string;
  email: string;
  phone_number: string;
}

export interface CreatePaymentData {
  payment_method: string;
  amount: number;
  description: string;
}

export interface OrderResponse {
  id: number;
  package_benefits_id: number;
  add_branch: number;
  add_employees: number;
  company_name: string;
  email: string;
  phone_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  id: string;
  order_id: number;
  payment_method: string;
  amount: number;
  status: string;
  payment_url?: string;
  xendit_invoice_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: CreateOrderData): Promise<OrderResponse> => {
  try {
    console.log("Creating order with:", orderData);

    const response = await api.post("/admin/packages/order", orderData);

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    
    return response.data;
    
  } catch (error: any) {
    console.error("Detailed createOrder error:", error);
    
    // Handle axios error response
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      throw new Error(`Failed to create order: ${error.response.data.error || error.response.data.message || `HTTP Error: ${error.response.status}`}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error: Unable to reach server");
    } else {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
};

/**
 * Create a payment for an existing order
 */
export const createPayment = async (orderId: number, paymentData: CreatePaymentData): Promise<PaymentResponse> => {
  try {
    console.log("Creating payment for order:", orderId, "with data:", paymentData);
    
    const response = await api.post(`/admin/packages/order/${orderId}/payment`, paymentData);

    console.log("Payment response status:", response.status);
    console.log("Payment response data:", response.data);
    
    return response.data;
    
  } catch (error: any) {
    console.error("Detailed createPayment error:", error);
    
    if (error.response) {
      console.error("Payment API Error:", error.response.data);
      throw new Error(`Failed to create payment: ${error.response.data.error || error.response.data.message || `HTTP Error: ${error.response.status}`}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error: Unable to reach server");
    } else {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }
};

/**
 * Generate QRIS data string for QR code payment
 */
export const generateQRISData = (amount: number, orderRef: string): string => {
  const qrisString = `00020101021226670016ID.LINKAJA.WWW011893600911234567890204${orderRef}0303UMI51440014ID.CO.QRIS.WWW0215ID20232024567890303UMI5204481253033605406${amount}5802ID5914MERCHANT_NAME6007Jakarta61051234062070703A0163044B2A`;
  return qrisString;
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (orderId: number, paymentId: string) => {
  try {
    console.log(`Checking payment status for order ${orderId}, payment ${paymentId}`);
    
    const response = await api.get(`/admin/packages/order/${orderId}/payment/${paymentId}/status`);
    
    console.log("Payment status response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    
    if (error.response) {
      console.error("Payment status API Error:", error.response.data);
      throw new Error(`Failed to check payment status: ${error.response.data.error || error.response.data.message || `HTTP Error: ${error.response.status}`}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error: Unable to reach server");
    } else {
      throw new Error(`Failed to check payment status: ${error.message}`);
    }
  }
};

/**
 * Get order details with company info
 */
export const getOrderWithCompany = async (orderId: number) => {
  try {
    console.log(`Getting order details for order ${orderId}`);
    
    const response = await api.get(`/admin/packages/order/${orderId}`);
    
    console.log("Order details response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Error getting order details:", error);
    
    if (error.response) {
      console.error("Order details API Error:", error.response.data);
      throw new Error(`Failed to get order details: ${error.response.data.error || error.response.data.message || `HTTP Error: ${error.response.status}`}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error: Unable to reach server");
    } else {
      throw new Error(`Failed to get order details: ${error.message}`);
    }
  }
};

/**
 * Update order status
 */
export const updateOrder = async (orderId: number, updateData: any) => {
  try {
    console.log(`Updating order ${orderId} with data:`, updateData);
    
    const response = await api.put(`/admin/packages/order/${orderId}`, updateData);
    
    console.log("Update order response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Error updating order:", error);
    
    if (error.response) {
      console.error("Update order API Error:", error.response.data);
      throw new Error(`Failed to update order: ${error.response.data.error || error.response.data.message || `HTTP Error: ${error.response.status}`}`);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error("Network error: Unable to reach server");
    } else {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }
};

/**
 * Process complete checkout flow
 */
export const processCheckout = async (
  orderData: CreateOrderData,
  paymentData: Omit<CreatePaymentData, 'description'>,
  packageName: string
): Promise<{
  order: OrderResponse;
  payment: PaymentResponse;
}> => {
  try {
    // Step 1: Create order
    console.log("Step 1: Creating order...");
    const order = await createOrder(orderData);
    console.log("Order created successfully:", order);

    // Step 2: Create payment
    const fullPaymentData: CreatePaymentData = {
      ...paymentData,
      description: `Payment for ${packageName} - ${orderData.company_name}`,
    };

    console.log("Step 2: Creating payment...");
    const payment = await createPayment(order.id, fullPaymentData);
    console.log("Payment created successfully:", payment);

    return { order, payment };
  } catch (error: any) {
    console.error("Error during checkout process:", error);
    throw new Error(`Checkout failed: ${error.message}`);
  }
};