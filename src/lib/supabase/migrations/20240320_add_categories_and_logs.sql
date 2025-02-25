-- Add more diverse service categories
INSERT INTO service_categories (id, name, description, icon, business_category_id, status) VALUES
  ('cat_beauty_spa', 'Beauty & Spa', 'Beauty treatments, massages, and wellness services', 'spa', 'bcat_personal_care', 'active'),
  ('cat_hair_salon', 'Hair Salon', 'Haircuts, styling, and hair treatments', 'cut', 'bcat_personal_care', 'active'),
  ('cat_nail_care', 'Nail Care', 'Manicures, pedicures, and nail art', 'nail_salon', 'bcat_personal_care', 'active'),
  ('cat_fitness', 'Fitness & Training', 'Personal training, group classes, and fitness coaching', 'fitness', 'bcat_health', 'active'),
  ('cat_yoga', 'Yoga & Meditation', 'Yoga classes, meditation sessions, and mindfulness', 'yoga', 'bcat_health', 'active'),
  ('cat_physio', 'Physiotherapy', 'Physical therapy and rehabilitation services', 'medical', 'bcat_health', 'active'),
  ('cat_dental', 'Dental Care', 'General dentistry and specialized dental services', 'tooth', 'bcat_health', 'active'),
  ('cat_auto_repair', 'Auto Repair', 'Vehicle maintenance and repair services', 'car', 'bcat_automotive', 'active'),
  ('cat_car_wash', 'Car Wash', 'Vehicle cleaning and detailing services', 'local_car_wash', 'bcat_automotive', 'active'),
  ('cat_home_cleaning', 'Home Cleaning', 'Residential cleaning and maintenance', 'cleaning_services', 'bcat_home', 'active'),
  ('cat_plumbing', 'Plumbing', 'Plumbing repairs and installations', 'plumbing', 'bcat_home', 'active'),
  ('cat_electrical', 'Electrical', 'Electrical repairs and installations', 'electric', 'bcat_home', 'active'),
  ('cat_landscaping', 'Landscaping', 'Garden design and maintenance', 'grass', 'bcat_home', 'active'),
  ('cat_photography', 'Photography', 'Professional photography services', 'camera', 'bcat_creative', 'active'),
  ('cat_graphic_design', 'Graphic Design', 'Visual design and branding services', 'design', 'bcat_creative', 'active');

-- Add sample error logs for testing
INSERT INTO error_logs (id, user_id, error_type, error_message, error_details, stack_trace, created_at) VALUES
  ('err_auth_001', 'usr_test_1', 'AUTH_ERROR', 'Failed to authenticate user', '{"reason": "Invalid credentials", "attempts": 3}', 'Error: Authentication failed\n    at AuthService.login (/src/services/auth.ts:45)\n    at async Function.handleLogin (/src/pages/login.ts:32)', NOW()),
  ('err_payment_001', 'usr_test_2', 'PAYMENT_ERROR', 'Payment processing failed', '{"amount": 99.99, "currency": "USD", "provider": "stripe"}', 'Error: Payment declined\n    at PaymentService.process (/src/services/payment.ts:78)\n    at async Function.handlePayment (/src/pages/checkout.ts:65)', NOW()),
  ('err_booking_001', 'usr_test_3', 'BOOKING_ERROR', 'Failed to create booking', '{"service_id": "svc_123", "date": "2024-03-20"}', 'Error: Slot already booked\n    at BookingService.create (/src/services/booking.ts:112)\n    at async Function.handleBooking (/src/pages/book.ts:89)', NOW()),
  ('err_service_001', 'usr_test_4', 'SERVICE_ERROR', 'Service creation failed', '{"name": "New Service", "price": 149.99}', 'Error: Invalid service data\n    at ServiceService.create (/src/services/service.ts:156)\n    at async Function.handleServiceCreation (/src/pages/services/new.ts:45)', NOW()),
  ('err_profile_001', 'usr_test_5', 'PROFILE_ERROR', 'Profile update failed', '{"field": "business_hours", "value": null}', 'Error: Invalid business hours format\n    at ProfileService.update (/src/services/profile.ts:234)\n    at async Function.handleProfileUpdate (/src/pages/profile/edit.ts:78)', NOW()); 