-- 銓宏國際 產品提案系統 資料庫結構
-- 適用於 Supabase PostgreSQL

-- 產品資料表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    item_number INTEGER NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    cost_range VARCHAR(50) NOT NULL,
    quote_range VARCHAR(50) NOT NULL,
    margin VARCHAR(20) NOT NULL,
    specifications TEXT NOT NULL,
    features TEXT NOT NULL,
    selection_reason TEXT NOT NULL,
    supplier VARCHAR(200) NOT NULL,
    lead_time VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 客戶回饋資料表
CREATE TABLE IF NOT EXISTS customer_feedback (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    interested_product_ids INTEGER[] DEFAULT '{}',
    feedback_text TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 專案資料表
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    quantity_range VARCHAR(50),
    target_cost VARCHAR(50),
    customer_budget VARCHAR(50),
    payment_terms VARCHAR(100),
    delivery_location VARCHAR(200),
    style_reference TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入範例資料：A0015-260320 易集專案
INSERT INTO projects (project_code, customer_name, contact_person, quantity_range, target_cost, customer_budget, payment_terms, delivery_location, style_reference) 
VALUES (
    'A0015-260320',
    '易集',
    'Rebecca',
    '12,000-20,000 PCS',
    'RMB 3-3.5',
    'RMB 5',
    '人民幣付款',
    '上海工廠（整組打包）',
    '布丁狗保溫袋（可愛/療癒風）'
) ON CONFLICT (project_code) DO NOTHING;

-- 插入範例產品資料
INSERT INTO products (project_id, item_number, product_type, product_name, cost_range, quote_range, margin, specifications, features, selection_reason, supplier, lead_time, rating) VALUES
('A0015-260320', 1, '保溫袋/便當袋', '療癒系鋁箔保溫便當袋', 'RMB 3.2-3.8', 'RMB 4.8-5.2', '25-30%', '21×15×22cm / 12安帆布+3mm鋁箔珍珠棉', '外層帆布可全彩印刷，鋁箔內襯保溫保冷3-4小時，立體造型容量大', '符合客戶提供的參考品項，市場接受度高，印刷面積大適合品牌露出，實用性強', '本道紙塑-陳先生', '25-30天', 5),
('A0015-260320', 2, '收納包/餐具袋', '質感帆布餐具收納包', 'RMB 2.8-3.3', 'RMB 4.5-5.0', '35-40%', '25×8cm（展開）/ 8安帆布+內裡滌綸 / 綁帶固定', '捲軸式設計，內含餐具固定格層，可搭配環保餐具組合，外層大面積印刷', 'ESG趨勢熱門品項，企業禮贈接受度高，與保溫袋可組合為套組，成本符合目標', '本道紙塑-陳先生', '20-25天', 4),
('A0015-260320', 3, '保冷袋/飲料提袋', '手搖飲專用保冷提袋', 'RMB 2.5-3.0', 'RMB 4.0-4.8', '35-40%', '底10×10cm，高18cm / 材質：潛水布或帆布+鋁箔 / 提把設計', '台灣手搖飲文化熱門周邊，鋁箔內襯可保冷2-3小時，可放700cc飲料杯', '台灣市場熱門，年輕族群喜愛，單價低可大量發送，印刷面積適中', '1688溫州工廠（專業保冷袋）', '20-25天', 4),
('A0015-260320', 4, '帆布袋/托特包', '厚磅帆布托特包（有底有側）', 'RMB 3.5-4.2', 'RMB 5.5-6.5', '30-35%', '35×12×28cm / 12安帆布 / 內袋+磁扣設計', '經典實用款，12安厚磅帆布質感佳，有底有側容量大，雙面可印刷', '最通用的禮贈品，各年齡層都適用，使用頻率高品牌曝光度佳，銓宏強項產品', '本道紙塑-陳先生', '20-25天', 4),
('A0015-260320', 5, '束口袋/收納袋', '質感帆布束口袋（大+小組合）', 'RMB 3.0-3.5', 'RMB 5.0-6.0', '35-40%', '大袋20×25cm + 小袋12×15cm / 8安帆布 / 棉繩束口', '大小袋組合CP值高，小袋可裝耳機/充電線，大袋可裝文具/化妝品，束口設計方便', '一組兩個視覺價值感高，可分開使用或組合販售，成本控制在目標內，印刷面積充足', '本道紙塑-陳先生', '20-25天', 5);

-- 建立 Row Level Security (RLS) 政策
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 允許匿名讀取
CREATE POLICY "Allow anonymous read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON projects FOR SELECT USING (true);

-- 允許匿名插入回饋
CREATE POLICY "Allow anonymous insert" ON customer_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read" ON customer_feedback FOR SELECT USING (true);

-- 建立更新時間自動觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON customer_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
