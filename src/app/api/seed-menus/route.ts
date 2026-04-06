import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const categories = ["Khai vị", "Món chính", "Hải Sản", "Lẩu & Nướng", "Món ăn kèm", "Đồ uống", "Tráng miệng", "Combo"];

const baseItems = {
    "Khai vị": [
        { name: "Salad Cá Hồi Na Uy", price: 185000, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600", desc: "Cá hồi áp chảo quyện sốt chanh leo chua ngọt, kèm rau củ hữu cơ.", tags: ["Thanh đạm", "Khai vị", "Healthy"], kidsFriendly: true, seafood: true, onionFree: true, status: "Healthy" },
        { name: "Súp Nấm Truffle Đen", price: 250000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Nấm truffle thượng hạng nấu chảy cùng kem nấm rơm béo ngậy.", tags: ["Thanh đạm", "Signature"], kidsFriendly: false, seafood: false, onionFree: false, status: "Chef Pick" },
        { name: "Gỏi Cuốn Tôm Thịt", price: 85000, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600", desc: "Tôm thịt cuộn cùng rau thơm, mắm nêm đậm đà.", tags: ["Truyền thống"], kidsFriendly: true, seafood: true, onionFree: true, status: "" },
        { name: "Gỏi Xoài Xanh Tai Heo", price: 125000, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", desc: "Giòn sần sật với tai heo ngâm mắm mặn ngọt chua cay.", tags: ["Cay nhẹ", "Nhậu"], kidsFriendly: false, seafood: false, onionFree: false, status: "Best Seller" },
        { name: "Hoành Thánh Chiên Giòn", price: 95000, img: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600", desc: "Hoành thánh nhân tôm thịt chiên giòn rụm với sốt chua ngọt.", tags: ["Trẻ em", "Ăn chơi"], kidsFriendly: true, seafood: true, onionFree: true, status: "Kids Choice" },
        { name: "Chả Giò Trái Cây Hải Sản", price: 145000, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", desc: "Chả giò kết hợp hải sản và trái cây 4 mùa đặc biệt.", tags: ["Signature", "Trẻ em"], kidsFriendly: true, seafood: true, onionFree: true, status: "New" },
        { name: "Hàu Sữa Pháp Phô Mai (2 con)", price: 110000, img: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600", desc: "Hàu sữa béo ngậy phủ phô mai đút lò.", tags: ["Hải sản"], kidsFriendly: true, seafood: true, onionFree: true, status: "Trending" },
        { name: "Nem Cua Bể Hải Phòng", price: 165000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Đậm vị miền biển, chiên giòn tan.", tags: ["Truyền thống", "Signature"], kidsFriendly: true, seafood: true, onionFree: false, status: "" },
        { name: "Salad Ức Gà Nướng Mật Ong", price: 135000, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", desc: "Ức gà mềm bổ dưỡng cho chế độ giảm cân.", tags: ["Healthy", "Thanh đạm", "Ít calo"], kidsFriendly: true, seafood: false, onionFree: true, status: "Healthy" },
        { name: "Gỏi Ngó Sen Tôm Thịt", price: 140000, img: "https://images.unsplash.com/photo-1546767012-149fa6a88b8e?w=600", desc: "Thanh mát, giòn ngọt ngó sen tôm thịt chua ngọt.", tags: ["Khai vị"], kidsFriendly: false, seafood: true, onionFree: false, status: "" },
    ],
    "Món chính": [
        { name: "Sườn Nướng Tảng BBQ Texas", price: 450000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600", desc: "Sườn heo nhập khẩu nướng chậm 12h, sốt BBQ phong cách Texas đậm đà.", tags: ["Nhóm 2", "Đậm đà", "Món mới"], kidsFriendly: true, seafood: false, onionFree: false, status: "Best Seller" },
        { name: "Thăn Lõi Bò Mỹ Nướng (Striploin)", price: 650000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Thăn bò Mỹ mềm nọng nước, nướng mọi kèm sốt tiêu đen.", tags: ["Signature", "High-end"], kidsFriendly: false, seafood: false, onionFree: false, status: "Chef Pick" },
        { name: "Cơm Chiên Trái Thơm Hải Sản", price: 185000, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600", desc: "Cơm chiên giòn đựng trong trái thơm nguyên quả.", tags: ["Bán chạy", "Hải sản"], kidsFriendly: true, seafood: true, onionFree: false, status: "Trending" },
        { name: "Mì Ý Carbonara Sốt Kem", price: 165000, img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600", desc: "Mì Ý Carbonara chuẩn vị Ý với bacon và kem tươi.", tags: ["Trẻ em", "Béo ngậy"], kidsFriendly: true, seafood: false, onionFree: true, status: "Kids Choice" },
        { name: "Gà Nướng Mắc Khén Tây Bắc", price: 320000, img: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=600", desc: "Gà đồi nướng mọi nêm gia vị Mắc Khén rùng rợn.", tags: ["Chuyên đề", "Cay"], kidsFriendly: false, seafood: false, onionFree: false, status: "New Arrival" },
        { name: "Bò Lúc Lắc Khoai Tây Chiên", price: 195000, img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600", desc: "Bò thăn thái vuông xào cùng hành ớt đậm vị, khoai chiên xốc tỏi.", tags: ["Truyền thống"], kidsFriendly: true, seafood: false, onionFree: false, status: "" },
        { name: "Cá Chẽm Hấp Tương Gừng", price: 280000, img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600", desc: "Cá chẽm phi lê hấp cùng tương gừng nồng ấm.", tags: ["Thanh đạm", "Healthy"], kidsFriendly: false, seafood: true, onionFree: false, status: "Healthy" },
        { name: "Bồ Câu Quay Mật Ong", price: 250000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Bồ câu quay giòn da đậm vị mật ong ăn kèm bánh bao chiên.", tags: ["Signature", "Đặc sản"], kidsFriendly: true, seafood: false, onionFree: false, status: "" },
        { name: "Vịt Quay Bắc Kinh (Nửa con)", price: 450000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Vịt quay da giòn rụm cuốn bánh đa và hành ngò, sốt hoisin.", tags: ["Nhóm 2", "Bán chạy"], kidsFriendly: true, seafood: false, onionFree: false, status: "Trending" },
        { name: "Đậu Nành Nhật Xóc Muối Hồ", price: 120000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Ghiền đậu nành luộc Nhật xốt đậm. Ăn chay ngon.", tags: ["Ăn chay", "Khai vị"], kidsFriendly: true, seafood: false, onionFree: true, status: "Vegan" },
    ],
    "Hải Sản": [
        { name: "Tôm Hùm Bỏ Lò Phô Mai (500g)", price: 850000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Tôm hùm baby xẻ đôi đút lò cùng phô mai Pháp.", tags: ["Hải sản", "High-end", "Bán chạy"], kidsFriendly: true, seafood: true, onionFree: true, status: "Best Seller" },
        { name: "Cua Mặt Trăng Hấp Bia (1kg)", price: 1250000, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600", desc: "Cua mặt trăng thịt chắc ngọt cực hiếm có.", tags: ["Đặc biệt", "Hải sản", "Nhóm 4"], kidsFriendly: false, seafood: true, onionFree: true, status: "Chef Pick" },
        { name: "Sashimi Tổng Hợp 5 Món", price: 950000, img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600", desc: "Cá hồi, Cá ngừ, Sò đỏ, Bạch tuộc, Trứng cá hồi tươi rói.", tags: ["Tươi sống", "Cao cấp"], kidsFriendly: false, seafood: true, onionFree: true, status: "Sushi" },
        { name: "Mực Ống Nướng Sa Tế", price: 220000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Mực ống Phú Quốc nướng mọi cay cay cùng sa tế tôm.", tags: ["Cay", "Nhậu", "Bán chạy"], kidsFriendly: false, seafood: true, onionFree: false, status: "Trending" },
        { name: "Ốc Hương Xào Trứng Muối", price: 280000, img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600", desc: "Ốc hương to giòn sừn sựt quyện cùng sốt trứng muối béo ngậy khó cưỡng.", tags: ["Hải sản", "Gây nghiện"], kidsFriendly: true, seafood: true, onionFree: false, status: "New Arrival" },
        { name: "Sò Điệp Nướng Mỡ Hành (Phần)", price: 180000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Sò điệp cồi lớn mềm nướng thơm cùng đậu phộng mỡ hành.", tags: ["Hải sản", "Khuyên dùng"], kidsFriendly: true, seafood: true, onionFree: false, status: "" },
        { name: "Miến Xào Cua Cà Mau", price: 350000, img: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600", desc: "Thịt cua xé sợi xào tơi cùng miến rong và nấm mèo.", tags: ["Món chính", "Hải sản"], kidsFriendly: true, seafood: true, onionFree: false, status: "Best Seller" },
        { name: "Cá Điêu Hồng Chiên Xù Cuốn Bánh Tráng", price: 240000, img: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600", desc: "Cá chiên xù vây cuốn cùng mắm me chua ngọt tuyệt đỉnh.", tags: ["Gia đình", "Truyền thống"], kidsFriendly: true, seafood: true, onionFree: false, status: "" },
        { name: "Bạch Tuộc Nhúng Giấm", price: 260000, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", desc: "Bạch tuộc sữa giòn sần sật nhúng nước giấm dừa chua thanh.", tags: ["Khai vị", "Nhậu nhẹt"], kidsFriendly: false, seafood: true, onionFree: false, status: "Hot" },
        { name: "Tôm Sú Rang Muối Hồng Kông", price: 320000, img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600", desc: "Tôm sú vỏ mỏng rang muối ớt tỏi khô phong cách HK.", tags: ["Cay nhẹ", "Hải sản", "Signature"], kidsFriendly: false, seafood: true, onionFree: false, status: "Chef Pick" }
    ],
    "Lẩu & Nướng": [
        { name: "Lẩu Thuyền Chài Đặc Biệt", price: 1250000, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600", desc: "Hương vị biển cả với tôm hùm, cua Cà Mau và nước dùng bí truyền.", tags: ["Nhóm 4-6", "Hải sản", "Bán chạy", "Signature"], kidsFriendly: false, seafood: true, onionFree: false, status: "Best Seller" },
        { name: "Lẩu Thái Tomyum Gắn Kết", price: 650000, img: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600", desc: "Trọn vị chua cay chuẩn Thái lan, topping bò mỹ và hải sản.", tags: ["Cay", "Nhóm 2", "Trending"], kidsFriendly: false, seafood: true, onionFree: false, status: "Trending" },
        { name: "Lẩu Gà Lá É Phú Yên", price: 480000, img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600", desc: "Gà tre ngọt thịt nấu măng chua và lá é thơm lừng nức nở.", tags: ["Truyền thống", "Đặc sản", "Nhóm 4-6"], kidsFriendly: true, seafood: false, onionFree: false, status: "Hot" },
        { name: "Lẩu Nấm Chay Dưỡng Sinh", price: 350000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Hơn 10 loại nấm quý và thảo mộc ninh ngọt tự nhiên.", tags: ["Ăn chay", "Healthy", "Thanh đạm"], kidsFriendly: true, seafood: false, onionFree: false, status: "Vegan" },
        { name: "Lẩu Riêu Cua Bắp Bò", price: 450000, img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600", desc: "Nước dùng cua đồng sánh quyện cùng bắp bò, hột vịt lộn và rau muống bổ củi.", tags: ["Miền Bắc", "Nhóm 4"], kidsFriendly: true, seafood: false, onionFree: false, status: "Must Try" },
        { name: "Set Thịt Nướng Tổng Hợp Yakiniku", price: 890000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600", desc: "Combo nướng kiểu Nhật gồm bò Wagyu M4, dẻ sườn, lưỡi bò và ba chỉ heo.", tags: ["Cao cấp", "Nhóm 2"], kidsFriendly: true, seafood: false, onionFree: false, status: "Premium" },
        { name: "Ba Chỉ Bò Cuộn Nấm Kim Châm Nướng", price: 160000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Ba chỉ béo mềm cuộn nấm kim châm ngọt nước, ăn cực cuốn.", tags: ["Ăn kèm nướng", "Bán chạy"], kidsFriendly: true, seafood: false, onionFree: true, status: "" },
        { name: "Bò Tơ Củ Chi Nướng Tảng", price: 340000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Thịt bò tơ da xèo xèo trên than hồng mềm ngọt chấm chao tôm.", tags: ["Nhậu", "Đặc sản"], kidsFriendly: false, seafood: false, onionFree: false, status: "New" },
        { name: "Dẻ Sườn Bò Úc Sốt Mật Ong", price: 280000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600", desc: "Sườn bò tẩm ướp sốt mật ong cực kì hợp khẩu vị người Việt.", tags: ["Thịt nướng", "Khuyên dùng"], kidsFriendly: true, seafood: false, onionFree: false, status: "Chef Pick" },
        { name: "Hàu Nướng Mỡ Hành Chảo Giữ Nhiệt", price: 150000, img: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600", desc: "Hàu nướng sẵn mỡ hành phục vụ trên chảo gang luôn nóng.", tags: ["Hải sản", "Nhậu"], kidsFriendly: false, seafood: true, onionFree: false, status: "Hot" }
    ],
    "Món ăn kèm": [
        { name: "Cơm Phô Mai Bỏ Lò Trứng Cá Hồi", price: 165000, img: "/images/menu_clean/com_pho_mai.png", desc: "Hạt cơm giòn tan phủ phô mai mozzarela béo ngậy trộn trứng cá.", tags: ["Ăn kèm", "Món no", "Trẻ em"], kidsFriendly: true, seafood: true, onionFree: true, status: "Trending" },
        { name: "Rau Salad Muối Mè", price: 65000, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", desc: "Rau xanh tổng hợp trộn dấm đen và dầu mè giải ngán.", tags: ["Healthy", "Thanh đạm"], kidsFriendly: true, seafood: false, onionFree: true, status: "Vegan" },
        { name: "Cơm Trắng Nồi Đất", price: 35000, img: "/images/menu_clean/com_trang_noi_dat.png", desc: "Cơm dẻo nấu từ gạo ST25 loại 1 ngon hàng đầu thế giới ngay trong niêu đất.", tags: ["Cơm", "Ăn kém"], kidsFriendly: true, seafood: false, onionFree: true, status: "" },
        { name: "Khoai Tây Lắc Phô Mai Trái Tim", price: 85000, img: "/images/menu_clean/khoai_tay_trai_tim.png", desc: "Khoai chuối cắt hình trái tim lắc phô mai Cheddar cực dính.", tags: ["Ăn chơi", "Trẻ em"], kidsFriendly: true, seafood: false, onionFree: true, status: "Kids" },
        { name: "Bánh Mì Bơ Tỏi", price: 45000, img: "/images/menu_clean/banh_mi_bo_toi.png", desc: "Lát baguette nướng giòn với bơ xịn và tỏi băm thơm phức.", tags: ["Ăn kèm", "Bán chạy"], kidsFriendly: true, seafood: false, onionFree: false, status: "Best Seller" },
        { name: "Đậu Bắp Luộc Quẹt Chảo", price: 55000, img: "/images/menu_clean/dau_bap_luoc.png", desc: "Đậu bắp luộc sơ chấm cùng tương chao hoặc kho quẹt mặn.", tags: ["Ăn chay", "Thanh đạm"], kidsFriendly: true, seafood: false, onionFree: false, status: "" },
        { name: "Canh Rong Biển Ngao Tươi", price: 80000, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600", desc: "Rong biển bổ dưỡng mix ngao tươi thanh mát giải nhiệt.", tags: ["Hải sản", "Canh"], kidsFriendly: true, seafood: true, onionFree: true, status: "Healthy" },
        { name: "Mì Trứng Xào Hành Baro", price: 95000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Sợi mì dai trứng vàng tươi phi hành baro ăn kèm cực hợp.", tags: ["Món no"], kidsFriendly: true, seafood: false, onionFree: false, status: "" },
        { name: "Nấm Đùi Gà Nướng Bơ", price: 110000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Nấm đùi gà khổng lồ nạc nướng bơ tỏi ngọt lịm như thịt.", tags: ["Healthy", "Ăn chay", "Đặc sắc"], kidsFriendly: true, seafood: false, onionFree: false, status: "Vegan" },
        { name: "Kimchi Cải Thảo Hàn Quốc", price: 40000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Nhà hàng tự muối, chuẩn độ lên men không hóa chất.", tags: ["Cay", "Ăn kèm"], kidsFriendly: false, seafood: false, onionFree: false, status: "Sides" }
    ],
    "Đồ uống": [
        { name: "Trà Đào Cam Sả Tươi", price: 65000, img: "/images/menu_clean/tra_dao.png", desc: "Giải khát mạnh mẽ, the mát thảo mộc và ngọt đào.", tags: ["Giải khát", "Bán chạy", "Trẻ em"], kidsFriendly: true, seafood: false, onionFree: true, status: "Refresh" },
        { name: "Nước Ép Dưa Hấu Organic", price: 75000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Lọc cặn hoàn toàn nguyên chất 100% không đường.", tags: ["Healthy", "Ít đường", "Trẻ em"], kidsFriendly: true, seafood: false, onionFree: true, status: "Healthy" },
        { name: "Bia Tươi Hefeweizen Thủ Công", price: 95000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Hương vị lúa mì nhẹ nhàng, men nổi vị chuối trái cây.", tags: ["Cồn", "Craft Beer", "Nhậu"], kidsFriendly: false, seafood: false, onionFree: true, status: "Craft" },
        { name: "Cocktail Sunset Margarita", price: 155000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Tequila kết hợp cam chanh, cực chill cho tiệc tối hẹn hò.", tags: ["Cồn", "Hẹn hò", "Signature"], kidsFriendly: false, seafood: false, onionFree: true, status: "Signature" },
        { name: "Sữa Tươi Trân Châu Đường Đen Nướng", price: 85000, img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600", desc: "Dành riêng cho team ngọt ngào, đường đen khét thơm lừng.", tags: ["Ngọt", "Trẻ em"], kidsFriendly: true, seafood: false, onionFree: true, status: "Kids" },
        { name: "Moet & Chandon Imperial Brut (Chai)", price: 2500000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Champagne trứ danh hoàn hảo cho lễ kỷ niệm.", tags: ["Cao cấp", "Tiệc"], kidsFriendly: false, seafood: false, onionFree: true, status: "Premium" },
        { name: "Trà Vải Vỏ Đỏ", price: 65000, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600", desc: "Hồng trà Đài Loan lắc trân châu vải ngọt lịm.", tags: ["Bán chạy"], kidsFriendly: true, seafood: false, onionFree: true, status: "Trending" },
        { name: "Bia Heineken Xanh Cà Đã Lạnh", price: 45000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Chuẩn bia công nghiệp làm lạnh ở 2 độ C luôn the mát.", tags: ["Cồn", "Nhậu phổ thông"], kidsFriendly: false, seafood: false, onionFree: true, status: "" },
        { name: "Soda Chanh Chanh Dây", price: 70000, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600", desc: "Chua bật tung vị giác kích thích ăn ngon miệng hơn.", tags: ["Chua", "Trẻ em", "Giải nhiệt"], kidsFriendly: true, seafood: false, onionFree: true, status: "" },
        { name: "Vang Trắng Sauvignon Blanc (Ly)", price: 180000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Chua thanh và mùi trái nhiệt đới tuyệt hảo đi kèm Hải Sản.", tags: ["Hải sản pairing", "Cao cấp"], kidsFriendly: false, seafood: false, onionFree: true, status: "Pairing" },
    ],
    "Tráng miệng": [
        { name: "Bánh Panna Cotta Dâu Rừng Ý", price: 85000, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600", desc: "Mềm mịn chuẩn Milan với sốt mâm xôi chua ngọt quyến rũ.", tags: ["Ngọt", "Hẹn hò", "Bán chạy"], kidsFriendly: true, seafood: false, onionFree: true, status: "Best Seller" },
        { name: "Chè Khúc Bạch Hạnh Nhân Hạt Chia", price: 65000, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600", desc: "Giải nhiệt mát lành với hạt chia phô mai dẻo dai.", tags: ["Truyền thống", "Healthy"], kidsFriendly: true, seafood: false, onionFree: true, status: "Trending" },
        { name: "Kem Gelato Vani Orea Trân Châu", price: 95000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Kem ý dẻo mịn tự làm mỗi ngày, ít đường không mập.", tags: ["Kem", "Trẻ em"], kidsFriendly: true, seafood: false, onionFree: true, status: "Kids Choice" },
        { name: "Bánh Tiramisu Truyền Thống", price: 120000, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Cà phê, rượu nồng nàn cùng mascarpone xốp mịn màng.", tags: ["Cake", "Hẹn hò", "Signature"], kidsFriendly: false, seafood: false, onionFree: true, status: "Signature" },
        { name: "Đĩa Trái Cây 5 Loại Theo Mùa Theo Set", price: 250000, img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600", desc: "Cherry, dưa lưới, nho không hạt, dâu tây, xoài cắt sẵn.", tags: ["Healthy", "Nhóm 4"], kidsFriendly: true, seafood: false, onionFree: true, status: "Healthy" },
        { name: "Sữa Chua Nếp Cẩm Than Organic", price: 55000, img: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=600", desc: "Chua thanh dính dính hạt nếp than thơm bùi khó cưỡng.", tags: ["Truyền thống", "Tiêu hóa"], kidsFriendly: true, seafood: false, onionFree: true, status: "Digestive" },
        { name: "Flan Custard Cháy Caramel", price: 60000, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600", desc: "Béo ngậy thơm nức trứng gà vườn nhỏ xíu xinh xắn.", tags: ["Trẻ em", "Bán chạy"], kidsFriendly: true, seafood: false, onionFree: true, status: "" },
        { name: "Socola Nóng Chảy Tan Cùng Marshmallow", price: 105000, img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600", desc: "Socola đắng 70% nướng tan marshmallow dành cho ai mê đắng ngọt.", tags: ["Sưởi ấm", "Ngọt đắng"], kidsFriendly: true, seafood: false, onionFree: true, status: "New" },
        { name: "Chè Thái Trái Cây Đậu Đỏ", price: 75000, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", desc: "Phong cách nhiệt đới sầu riêng đậm đặc sữa dừa.", tags: ["Sầu riêng", "Nhiệt đới"], kidsFriendly: true, seafood: false, onionFree: true, status: "Hot" },
        { name: "Bánh Crepe Trà Xanh Ngàn Lớp", price: 110000, img: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600", desc: "Mỏng nhẹ thanh cảnh matcha Nhật nguyên chất.", tags: ["Thanh tịnh", "Cake"], kidsFriendly: true, seafood: false, onionFree: true, status: "Chef Pick" }
    ],
    "Combo": [
        { id: 701, name: "Combo Trưa Tiết Kiệm", price: 99000, originalPrice: 150000, img: "/food/combo-trua.jpg", desc: "Cơm chiên hải sản + Canh rong biển + 1 Trà đào cam sả.", tags: ["Giá tốt"], kidsFriendly: true, seafood: true, onionFree: false, status: "Lunch" },
        { id: 702, name: "Combo Gia Đình 3-4 Người", price: 399000, originalPrice: 500000, img: "/food/combo-family.jpg", desc: "Cá chẽm hấp tương + Sườn nướng BBQ + Rau muống xào tỏi + Cơm niêu + Tặng Dessert.", tags: ["Gia đình", "No bụng"], kidsFriendly: true, seafood: true, onionFree: false, status: "Family" },
        { id: 703, name: "Combo Couple Hẹn Hò", price: 599000, originalPrice: 750000, img: "/food/combo-couple.jpg", desc: "2 Bò Beefsteak + 1 Salad Rong Nho + 2 Rượu vang đỏ + 2 Panna Cotta dâu tây.", tags: ["Hẹn hò", "Cặp đôi"], kidsFriendly: false, seafood: false, onionFree: false, status: "Couple" },
        { id: 704, name: "Combo Nhậu Sương Sương", price: 299000, originalPrice: 380000, img: "/food/combo-nhau.jpg", desc: "Đậu nành Nhật + Mực nướng sa tế + Bồ câu quay + 4 Bia Tiger bạc.", tags: ["Nhậu", "Say sưa"], kidsFriendly: false, seafood: true, onionFree: false, status: "Drink" },
        { id: 705, name: "Combo Đôi Bạn Thân", price: 250000, originalPrice: 300000, img: "/food/combo-ban-than.jpg", desc: "2 Mì Carbonara + 1 Khoai chiên + 2 Sinh tố. Ăn sập quán cùng cạ cứng.", tags: ["Bạn thân"], kidsFriendly: true, seafood: false, onionFree: true, status: "Couple" },
        { id: 706, name: "Combo Liên Hoan 4-6 Người", price: 890000, originalPrice: 990000, img: "/food/combo-lien-hoan.jpg", desc: "Set hải sản tổng hợp và bia lạnh cho nhóm bạn.", tags: ["Liên hoan"], kidsFriendly: false, seafood: true, onionFree: false, status: "Party" }
    ]
};

const generateMoreItems = () => {
    const result: any[] = [];
    let idCounter = 100;

    categories.forEach(cat => {
        const catItems = baseItems[cat as keyof typeof baseItems] || [];
        catItems.forEach((item: any) => {
            result.push({
                id: item.id || ++idCounter,
                category: cat,
                ...item
            });
        });

        if (cat !== "Combo") {
            for (let i = 0; i < 5; i++) {
                const item: any = catItems[i % catItems.length];
                const variations = ["Đặc biệt", "Size Lớn", "Hữu cơ", "Fusion", "Tự làm"];
                const varWord = variations[Math.floor(Math.random() * variations.length)];

                result.push({
                    id: ++idCounter,
                    category: cat,
                    name: `${item.name} ${varWord}`,
                    price: Math.floor(item.price * (Math.random() < 0.5 ? 1.2 : 0.8)),
                    img: item.img,
                    desc: `Phiên bản ${varWord.toLowerCase()} của món ${item.name}. ${item.desc}`,
                    tags: item.tags.filter((t: string) => t !== "Signature"), // slight tag variation
                    kidsFriendly: item.kidsFriendly,
                    seafood: item.seafood,
                    onionFree: item.onionFree,
                    status: Math.random() < 0.3 ? "New" : ""
                });
            }
        }
    });
    return result;
};

const fullItems = generateMoreItems();

const preferences = [
    { id: "kids", label: "Có trẻ em" },
    { id: "noOnion", label: "Không ăn hành/tỏi" },
    { id: "noSeafood", label: "Dị ứng hải sản" },
    { id: "healthy", label: "Ăn thanh đạm" },
    { id: "vegetarian", label: "Đồ chay" },
    { id: "lessSpicy", label: "Ít cay" }
];

const menuData = {
    categories,
    preferences,
    items: fullItems
};

export async function GET() {
    try {
        console.log("Starting seed process for DB...");
        const db = await getDb();

        const resid = '100';
        const jsonStr = JSON.stringify(menuData);

        await db.run(
            'INSERT INTO restaurant_menus (resid, menu_data) VALUES (?, ?) ON CONFLICT (resid) DO UPDATE SET menu_data = EXCLUDED.menu_data',
            [resid, jsonStr]
        );

        await db.run(
            'INSERT INTO restaurant_menus (resid, menu_data) VALUES (?, ?) ON CONFLICT (resid) DO UPDATE SET menu_data = EXCLUDED.menu_data',
            ['r1', jsonStr]
        );

        return NextResponse.json({ success: true, count: fullItems.length });
    } catch (err: any) {
        console.error('Failed to seed DB:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
