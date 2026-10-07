import { supabase } from './supabase.js';

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !data) return null;

  return {
    orderId: data.order_id,
    customerName: data.customer_name,
    items: data.items,
    totalPrice: data.total_price,
    status: data.status
  };
}
