-- Create function to delete user data in a transaction
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Delete bookings where user is customer
        DELETE FROM bookings WHERE customer_id = user_id;
        
        -- Delete services if user is business
        DELETE FROM services 
        WHERE business_id IN (
            SELECT id FROM businesses WHERE user_id = user_id
        );
        
        -- Delete business if exists
        DELETE FROM businesses WHERE user_id = user_id;
        
        -- Delete profile
        DELETE FROM profiles WHERE id = user_id;
        
        -- Commit transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        ROLLBACK;
        RAISE EXCEPTION 'Failed to delete user data: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 