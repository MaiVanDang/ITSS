use itss;
INSERT INTO ingredients (name, image, description, status, created_at, updated_at, due_date)
VALUES
    ('Gạo', 'https://down-vn.img.susercontent.com/file/f244b382489b8319e69665c91bbef2c1', 'Một loại ngũ cốc quan trọng trong ẩm thực Việt Nam.', 1, NOW(), NOW(), 2023),
    ('Đường', 'https://down-vn.img.susercontent.com/file/7247e283df6bea25f2ae6d902e4f174b', 'Chất làm ngọt tự nhiên thường dùng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Muối', 'https://down-vn.img.susercontent.com/file/9f98fef02997f6bd81a050a1e2edcfa9', 'Một loại gia vị không thể thiếu trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Nước mắm', 'https://down-vn.img.susercontent.com/file/2a91e5a5dcbd7c90e50553aa2867e9c5', 'Chất lỏng từ cá có mùi và vị đặc trưng, thường dùng trong nước chấm.', 1, NOW(), NOW(), 2023),
    ('Hành tây', 'https://down-vn.img.susercontent.com/file/e9983abad1d75aec68c752caf29032ae', 'Loại rau củ thường được dùng để làm gia vị trong nhiều món ăn.', 1, NOW(), NOW(), 2023),
    ('Ớt', 'https://down-vn.img.susercontent.com/file/c4f68fe5a5e8a98e2c09987415b4c121', 'Loại gia vị có vị cay thường được sử dụng trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Tỏi', 'https://down-vn.img.susercontent.com/file/395adb2c7d7b7e1d84a51ee7879647d3', 'Loại gia vị có mùi thơm đặc trưng, thường được dùng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Nước dừa', 'https://down-vn.img.susercontent.com/file/87cf54fabe3aba226f958b0946972d22', 'Chất lỏng từ trái dừa, thường được sử dụng trong nấu ăn và làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt', 'https://down-vn.img.susercontent.com/file/9995d72847fec82f0abf4c3b94e8c763', 'Loại chất làm ngọt thay thế đường, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Chanh', 'https://down-vn.img.susercontent.com/file/e62bc1c0ac49ee75e3689a3827b7b478', 'Quả chanh, thường dùng trong nấu ăn và làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Mỡ', 'https://down-vn.img.susercontent.com/file/vn-11134201-23030-vppkyy9qwwov8f', 'Chất béo có nguồn gốc từ động vật, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Nước tương', 'https://down-vn.img.susercontent.com/file/6126fb9642774b93a9aa32531dc920ba', 'Chất lỏng từ đậu nành, thường dùng làm gia vị trong nhiều món ăn.', 1, NOW(), NOW(), 2023),
    ('Rau mùi', 'https://down-vn.img.susercontent.com/file/9c43c8c90248cd5e6088422fed34b168', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Hành lá', 'https://down-vn.img.susercontent.com/file/670099be9a69f995193d31ef7cc4152e', 'Loại rau củ thường được dùng làm gia vị trong nhiều món ăn.', 1, NOW(), NOW(), 2023),
    ('Tiêu', 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lia6mj5o1g4265', 'Loại gia vị có mùi và vị cay thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Rau cải', 'https://down-vn.img.susercontent.com/file/028db333dbd6a02d158ac35dad68f769', 'Loại rau thường được dùng trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Ớt bột', 'https://down-vn.img.susercontent.com/file/dcc7e3f3527ec15c21a596e180f4abd7', 'Loại gia vị có vị cay thường được sử dụng trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Hành phi', 'https://down-vn.img.susercontent.com/file/f2e7cd4b58e85b72350e87f3a71e7c06', 'Loại gia vị có mùi thơm đặc trưng, thường được dùng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Ớt chuông', 'https://down-vn.img.susercontent.com/file/c3d70a5ca2f59601fc04ea2425ab9d99', 'Loại rau quả có hình dạng giống chuông, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Rau răm', 'https://down-vn.img.susercontent.com/file/sg-11134201-22110-8nzgaikszgkvbc', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Cà chua', 'https://down-vn.img.susercontent.com/file/78d41063da6188511d0e0ad64021aa3f', 'Loại quả có màu đỏ và có vị chua, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột nêm', 'https://down-vn.img.susercontent.com/file/7d9954ae3a4585356a01f55b8c60bc1c', 'Loại chất làm ngọt và gia vị thay thế đường, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột cà ri', 'https://down-vn.img.susercontent.com/file/469623cd96943f3c8878a10477ffb776', 'Loại gia vị có màu và vị đặc trưng, thường được sử dụng trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Rau cần tây', 'path/to/image26.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Bơ', 'path/to/image27.jpg', 'Loại quả có màu và vị đặc trưng, thường được sử dụng trong nấu ăn và làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Gừng', 'path/to/image28.jpg', 'Loại gia vị có mùi và vị đặc trưng, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Nước mắm Phan Thiết', 'path/to/image29.jpg', 'Loại nước mắm có nguồn gốc từ Phan Thiết, thường dùng trong nước chấm.', 1, NOW(), NOW(), 2023),
    ('Ớt xoài', 'path/to/image30.jpg', 'Loại ớt có hình dạng giống xoài, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Rau ngò', 'path/to/image31.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Khoai tây', 'path/to/image32.jpg', 'Loại củ có màu và vị đặc trưng, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Aji-ngon', 'path/to/image33.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Mỡ gà', 'path/to/image34.jpg', 'Chất béo có nguồn gốc từ gà, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Mắm tôm', 'path/to/image35.jpg', 'Chất lỏng từ tôm có mùi và vị đặc trưng, thường dùng trong nước chấm.', 1, NOW(), NOW(), 2023),
    ('Rau thì là', 'path/to/image36.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Cà rốt', 'path/to/image37.jpg', 'Loại củ có màu và vị đặc trưng, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Knorr', 'path/to/image38.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu ăn', 'path/to/image39.jpg', 'Loại dầu thực phẩm thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Cà phê', 'path/to/image40.jpg', 'Loại đồ uống có nguồn gốc từ hạt cà phê rang xay, thường được sử dụng làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Rau húng lủi', 'path/to/image41.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Khoai lang', 'path/to/image42.jpg', 'Loại củ có màu và vị đặc trưng, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Vedan', 'path/to/image43.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu ớt', 'path/to/image44.jpg', 'Loại dầu có vị cay thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Sữa đặc', 'path/to/image45.jpg', 'Chất lỏng từ sữa có đặc tính đặc trưng, thường được sử dụng trong nấu ăn và làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Rau diếp cá', 'path/to/image46.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Khoai môn', 'path/to/image47.jpg', 'Loại củ có màu và vị đặc trưng, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Masako', 'path/to/image48.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu hào', 'path/to/image49.jpg', 'Loại nước tương có mùi và vị đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Sữa tươi', 'path/to/image50.jpg', 'Chất lỏng từ sữa tươi có đặc tính đặc trưng, thường được sử dụng trong nấu ăn và làm đồ uống.', 1, NOW(), NOW(), 2023),
    ('Rau mồng tơi', 'path/to/image51.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Hành', 'path/to/image52.jpg', 'Loại rau củ thường được dùng làm gia vị trong nhiều món ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Thanh Trì', 'path/to/image53.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu mè', 'path/to/image54.jpg', 'Loại dầu thực phẩm thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Sữa chua', 'path/to/image55.jpg', 'Loại đồ uống có đặc tính và vị đặc trưng, thường được sử dụng làm đồ uống và trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Rau rong biển', 'path/to/image56.jpg', 'Loại rau có nguồn gốc từ biển, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bắp cải', 'path/to/image57.jpg', 'Loại rau có hình dạng giống cải, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Maggi', 'path/to/image58.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu hướng dương', 'path/to/image59.jpg', 'Loại dầu thực phẩm thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Kem tươi', 'path/to/image60.jpg', 'Chất lỏng từ sữa và kem có đặc tính và vị đặc trưng, thường được sử dụng trong làm kem và trong các món ăn.', 1, NOW(), NOW(), 2023),
    ('Rau ngổ', 'path/to/image61.jpg', 'Loại rau có mùi thơm đặc trưng, thường được sử dụng làm gia vị trong món ăn.', 1, NOW(), NOW(), 2023),
    ('Cải thảo', 'path/to/image62.jpg', 'Loại rau có hình dạng giống cải, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Bột ngọt Ajinomoto', 'path/to/image63.jpg', 'Loại chất làm ngọt và gia vị thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Dầu dừa', 'path/to/image64.jpg', 'Loại dầu thực phẩm có nguồn gốc từ dừa, thường được sử dụng trong nấu ăn.', 1, NOW(), NOW(), 2023),
    ('Sữa đậu nành', 'path/to/image65.jpg', 'Loại đồ uống có đặc tính và vị đặc trưng, thường được sử dụng làm đồ uống và trong các món ăn.', 1, NOW(), NOW(), 2023);


INSERT INTO dish (descriptions, recipe_des, status, type, create_at, update_at, name, image)
VALUES 
    ('Món ăn ngon', 'Hướng dẫn chuẩn bị và nấu món ăn ngon.', 1, 'Món chính', NOW(), NOW(), 'Mì xào hải sản', 'path/to/image1.jpg'),
    ('Món truyền thống', 'Cách làm món truyền thống ngon miệng.', 1, 'Món chính', NOW(), NOW(), 'Phở bò', 'path/to/image2.jpg'),
    ('Món đặc biệt', 'Cách làm món đặc biệt hấp dẫn.', 1, 'Món chính', NOW(), NOW(), 'Cá kho tộ', 'path/to/image3.jpg'),
    ('Món nhanh', 'Cách làm món nhanh và dễ dàng.', 1, 'Món chính', NOW(), NOW(), 'Gà rang muối', 'path/to/image4.jpg'),
    ('Món nhẹ', 'Cách làm món nhẹ cho bữa sáng.', 1, 'Món ăn sáng', NOW(), NOW(), 'Bánh mì sandwich', 'path/to/image5.jpg'),
    ('Món truyền thống', 'Cách làm món truyền thống ngon miệng.', 1, 'Món chính', NOW(), NOW(), 'Bún chả', 'path/to/image6.jpg'),
    ('Món hấp dẫn', 'Cách làm món hấp dẫn và thơm ngon.', 1, 'Món chính', NOW(), NOW(), 'Gà nướng', 'path/to/image7.jpg'),
    ('Món nhanh', 'Cách làm món nhanh và dễ dàng.', 1, 'Món chính', NOW(), NOW(), 'Bò kho', 'path/to/image8.jpg'),
    ('Món truyền thống', 'Cách làm món truyền thống ngon miệng.', 1, 'Món chính', NOW(), NOW(), 'Cơm gà', 'path/to/image9.jpg'),
    ('Món hấp dẫn', 'Cách làm món hấp dẫn và thơm ngon.', 1, 'Món chính', NOW(), NOW(), 'Lẩu thái', 'path/to/image10.jpg'),
    ('Món nhanh', 'Cách làm món nhanh và dễ dàng.', 1, 'Món chính', NOW(), NOW(), 'Bún riêu cua', 'path/to/image11.jpg'),
    -- Add more rows with real data in Vietnamese
    ('Món nhẹ', 'Cách làm món nhẹ cho bữa sáng.', 1, 'Món ăn sáng', NOW(), NOW(), 'Bánh xèo', 'path/to/image12.jpg'),
    ('Món truyền thống', 'Cách làm món truyền thống ngon miệng.', 1, 'Món chính', NOW(), NOW(), 'Bánh cuốn', 'path/to/image13.jpg'),
    ('Món hấp dẫn', 'Cách làm món hấp dẫn và thơm ngon.', 1, 'Món chính', NOW(), NOW(), 'Bò lúc lắc', 'path/to/image14.jpg'),
    ('Món nhanh', 'Cách làm món nhanh và dễ dàng.', 1, 'Món chính', NOW(), NOW(), 'Tôm hấp', 'path/to/image15.jpg'),
    -- Add more rows with real data in Vietnamese
    ('Món nhẹ', 'Cách làm món nhẹ cho bữa sáng.', 1, 'Món ăn sáng', NOW(), NOW(), 'Bánh bao', 'path/to/image17.jpg'),
    ('Món truyền thống', 'Cách làm món truyền thống ngon miệng.', 1, 'Món chính', NOW(), NOW(), 'Chả giò', 'path/to/image18.jpg'),
    ('Món hấp dẫn', 'Cách làm món hấp dẫn và thơm ngon.', 1, 'Món chính', NOW(), NOW(), 'Cá chiên', 'path/to/image19.jpg'),
    ('Món nhanh', 'Cách làm món nhanh và dễ dàng.', 1, 'Món chính', NOW(), NOW(), 'Mì quảng', 'path/to/image20.jpg');
    
-- Insert into dish_ingredients table
-- Insert into dish table

-- Insert into dish_ingredients table
INSERT INTO dish_ingredients (dish_id, ingredients_id)
VALUES
    (1, 1), (1, 2), (1, 3), -- Dish 1 ingredients
    (2, 4), (2, 5), (2, 6), -- Dish 2 ingredients
    (3, 7), (3, 8), (3, 9), -- Dish 3 ingredients
    (4, 10), (4, 11), (4, 12), -- Dish 4 ingredients
    -- Add more rows for the remaining dishes and their ingredients
    
    (50, 49), (50, 50); -- Dish 50 ingredients
    
    -- Chèn dữ liệu vào bảng "user"
INSERT INTO user (username, email, verified_time, password, create_at, update_at, status, avatar, name, gender, address, role)
VALUES 
    ('nguyenvan', 'nguyenvan@example.com', '2023-06-01 10:00:00', '12345678', '2023-06-01 10:00:00', '2023-06-01 10:00:00', 1, 'path/to/avatar1.jpg', 'Nguyễn Văn Nam', '123 Đường ABC, Quận XYZ, TP HCM', 'user'),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('nguyenthi', 'nguyenthi@example.com', '2023-06-02 11:00:00', 'abcdefgh', '2023-06-02 11:00:00', '2023-06-02 11:00:00', 1, 'path/to/avatar2.jpg', 'Nguyễn Thị Nữ',  '456 Đường XYZ, Quận ABC, TP HCM', 'user'),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('admin', 'admin@example.com', NULL, 'admin123', '2023-06-03 12:00:00', '2023-06-03 12:00:00', 1, 'path/to/avatar3.jpg', 'Nguyễn Thị Nữ', '456 Đường XYZ, Quận ABC, TP HCM', 'admin');
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "ingredients"

INSERT INTO shopping_attribute (user_id, buy_at, status, exprided, measure, quantity)
VALUES
    (1, '2023-06-01 14:00:00', 1, '2023-06-02 14:00:00', 'kg', 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (1, '2023-06-02 16:00:00', 1, '2023-06-03 16:00:00', 'cái', 5),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, '2023-06-03 18:00:00', 1, '2023-06-04 18:00:00', 'lit', 3);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "dish"
INSERT INTO dish (image, name, descriptions, recipe_des, status, type, create_at, update_at)
VALUES
    ('path/to/dish1.jpg', '1', 'Mô tả món ăn 1', 'Cách làm món ăn 1', 1, 'Loại 1', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('path/to/dish2.jpg', '2', 'Mô tả món ăn 2', 'Cách làm món ăn 2', 1, 'Loại 2', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('path/to/dish3.jpg', '3', 'Mô tả món ăn 3', 'Cách làm món ăn 3', 1, 'Loại 3', NOW(), NOW());
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "shopping"
INSERT INTO shopping (code, create_at, status, user_id)
VALUES
    ('SHOP001', '2023-06-01 10:00:00', 1, 1),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('SHOP002', '2023-06-02 11:00:00', 1, 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('SHOP003', '2023-06-03 12:00:00', 1, 1);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "dish_attribute"
INSERT INTO dish_attribute (dish_id, expride, cook_status, quantity, shopping_id, cook_date, create_at, update_at)
VALUES
    (1, '2023-06-01 14:00:00', 1, 2, 1, '2023-06-01 14:00:00', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, '2023-06-02 16:00:00', 1, 5, 1, '2023-06-02 16:00:00', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (3, '2023-06-03 18:00:00', 1, 3, 2, '2023-06-03 18:00:00', NOW(), NOW());
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "dish_ingredients"
INSERT INTO dish_ingredients (dish_id, ingredients_id)
VALUES
    (1, 1), (1, 2), (1, 3),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 2), (2, 3), (2, 4),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (3, 3), (3, 4), (3, 5);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "group_table"
INSERT INTO group_table (leader, name, create_at, update_at)
VALUES
    (1, 'Nhóm 1', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 'Nhóm 2', NOW(), NOW()),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (1, 'Nhóm 3', NOW(), NOW());
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "group_member"
INSERT INTO group_member (group_id, user_id)
VALUES
    (1, 1),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (3, 1);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "group_shopping"
INSERT INTO group_shopping (group_id, shopping_id)
VALUES
    (1, 1),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (3, 3);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "favorite"
INSERT INTO favorite (user_id, recipe_id)
VALUES
    (1, 1),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (1, 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 3);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "fridge"
INSERT INTO fridge (name, group_id, user_id)
VALUES
    ('Tủ lạnh 1',2, null, "group"),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('Tủ lạnh 2', null, 2, "personal"),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    ('Tủ lạnh 3', null, 1,"personal");
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

-- Chèn dữ liệu vào bảng "fridge_ingredients"
INSERT INTO fridge_ingredients (fridge_id, ingredients_id, quantity)
VALUES
    (1, 1, 3),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (1, 2, 2),
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác
    
    (2, 2, 1);
    -- Thêm thêm hàng với dữ liệu thực cho các trường khác

