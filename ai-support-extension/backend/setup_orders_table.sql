-- Create orders table
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mock data
INSERT INTO orders (order_id, customer_name, items, total_price, status) VALUES
('12345', 'John Doe', '[{"name": "Burger", "quantity": 2}, {"name": "Fries", "quantity": 1}]'::jsonb, '$15.00', 'Delivered'),
('67890', 'Jane Smith', '[{"name": "Pizza", "quantity": 1}, {"name": "Soda", "quantity": 2}]'::jsonb, '$20.00', 'In Transit');

-- Enable Row Level Security (optional but recommended)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access" ON orders
FOR ALL USING (true);
