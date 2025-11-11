-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Insert sample data
INSERT INTO expenses (name, date, cost, status) VALUES
('Office Rent', '2024-01-01', 2500.00, 'approved'),
('Equipment Purchase', '2024-01-15', 1200.50, 'approved'),
('Marketing Campaign', '2024-01-20', 800.00, 'cancelled'),
('Utilities', '2024-02-01', 350.75, 'approved'),
('Staff Training', '2024-02-10', 600.00, 'approved');