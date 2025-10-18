-- =====================================================
-- Automatic updated_at Timestamp Trigger for Classes
-- =====================================================
-- This trigger automatically sets the updated_at column
-- whenever a row in the classes table is updated

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON classes;

-- Create trigger on classes table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'classes'
    AND trigger_name = 'set_updated_at';
