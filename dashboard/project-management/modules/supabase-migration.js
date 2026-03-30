// Supabase 資料遷移模組 - 將 LocalStorage 資料遷移到 Supabase
// 使用方式：在瀏覽器控制台執行 migrateToSupabase()

const SUPABASE_MIGRATION = {
    // Supabase 配置（與 supabase-auth.js 一致）
    URL: 'https://djvyozmdenvzlbyieyss.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg',
    
    // 檢查 Supabase 是否可用
    async checkSupabase() {
        if (!window.supabase?.createClient) {
            console.error('❌ Supabase library 未載入');
            return false;
        }
        return true;
    },
    
    // 取得 Supabase 客戶端
    getClient() {
        return window.supabase.createClient(this.URL, this.ANON_KEY);
    },
    
    // 步驟 1: 檢查現有 LocalStorage 資料
    checkLocalData() {
        const projects = localStorage.getItem('chuanhung_projects_v1');
        const clients = localStorage.getItem('chuanhung_clients_v1');
        
        const result = {
            hasProjects: !!projects,
            hasClients: !!clients,
            projectCount: projects ? JSON.parse(projects).length : 0,
            clientCount: clients ? JSON.parse(clients).length : 0,
            projectsSize: projects ? (projects.length / 1024).toFixed(2) + ' KB' : '0 KB',
            clientsSize: clients ? (clients.length / 1024).toFixed(2) + ' KB' : '0 KB'
        };
        
        console.log('📊 LocalStorage 資料檢查結果:', result);
        return result;
    },
    
    // 步驟 2: 檢查 Supabase 資料表是否存在
    async checkTables() {
        const supabase = this.getClient();
        
        try {
            // 檢查 projects 表
            const { data: projects, error: pError } = await supabase
                .from('projects')
                .select('count')
                .limit(1);
            
            // 檢查 clients 表
            const { data: clients, error: cError } = await supabase
                .from('clients')
                .select('count')
                .limit(1);
            
            const result = {
                projectsTable: !pError,
                clientsTable: !cError,
                projectsError: pError?.message,
                clientsError: cError?.message
            };
            
            console.log('📊 Supabase 資料表檢查結果:', result);
            return result;
        } catch (e) {
            console.error('❌ 檢查資料表失敗:', e);
            return { error: e.message };
        }
    },
    
    // 步驟 3: 建立資料表（如果不存在）
    async createTables() {
        const supabase = this.getClient();
        
        console.log('🏗️ 正在建立資料表...');
        
        // 使用 SQL 建立資料表
        const createProjectsSQL = `
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                client TEXT,
                contact TEXT,
                quantity TEXT,
                deadline TEXT,
                progress INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                status_text TEXT,
                phase TEXT DEFAULT 'proposing',
                sales_rep TEXT DEFAULT 'Kevin',
                tasks JSONB DEFAULT '[]',
                quote_date TEXT,
                budget TEXT,
                duration TEXT,
                description TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        
        const createClientsSQL = `
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                contacts JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `;
        
        try {
            // 注意：Supabase 免費方案可能不支援直接執行 SQL
            // 這裡使用 RPC 或手動建立
            console.log('⚠️ 請在 Supabase Dashboard 手動建立資料表');
            console.log('Projects 表結構:', createProjectsSQL);
            console.log('Clients 表結構:', createClientsSQL);
            return { success: false, manual: true };
        } catch (e) {
            console.error('❌ 建立資料表失敗:', e);
            return { success: false, error: e.message };
        }
    },
    
    // 步驟 4: 遷移專案資料
    async migrateProjects() {
        const supabase = this.getClient();
        const projectsData = localStorage.getItem('chuanhung_projects_v1');
        
        if (!projectsData) {
            console.log('⚠️ 沒有專案資料需要遷移');
            return { success: true, count: 0 };
        }
        
        const projects = JSON.parse(projectsData);
        console.log(`🚀 開始遷移 ${projects.length} 個專案...`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const project of projects) {
            try {
                // 轉換資料格式以符合資料表結構
                const record = {
                    id: project.id,
                    name: project.name,
                    client: project.client,
                    contact: project.contact,
                    quantity: project.quantity,
                    deadline: project.deadline,
                    progress: project.progress || 0,
                    status: project.status || 'active',
                    status_text: project.statusText || project.status_text,
                    phase: project.phase || 'proposing',
                    sales_rep: project.sales_rep || 'Kevin',
                    tasks: project.tasks || [],
                    quote_date: project.quoteDate,
                    budget: project.budget,
                    duration: project.duration,
                    description: project.description,
                    notes: project.notes
                };
                
                const { error } = await supabase
                    .from('projects')
                    .upsert(record, { onConflict: 'id' });
                
                if (error) {
                    console.error(`❌ 專案 ${project.id} 遷移失敗:`, error);
                    errorCount++;
                    errors.push({ id: project.id, error: error.message });
                } else {
                    successCount++;
                    console.log(`✅ 專案 ${project.id} 遷移成功`);
                }
            } catch (e) {
                console.error(`❌ 專案 ${project.id} 遷移異常:`, e);
                errorCount++;
                errors.push({ id: project.id, error: e.message });
            }
        }
        
        const result = { success: true, count: successCount, errors: errorCount, details: errors };
        console.log('📊 專案遷移結果:', result);
        return result;
    },
    
    // 步驟 5: 遷移客戶資料
    async migrateClients() {
        const supabase = this.getClient();
        const clientsData = localStorage.getItem('chuanhung_clients_v1');
        
        if (!clientsData) {
            console.log('⚠️ 沒有客戶資料需要遷移');
            return { success: true, count: 0 };
        }
        
        const clients = JSON.parse(clientsData);
        console.log(`🚀 開始遷移 ${clients.length} 個客戶...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const client of clients) {
            try {
                const { error } = await supabase
                    .from('clients')
                    .upsert({
                        name: client.name,
                        contacts: client.contacts || []
                    }, { onConflict: 'name' });
                
                if (error) {
                    console.error(`❌ 客戶 ${client.name} 遷移失敗:`, error);
                    errorCount++;
                } else {
                    successCount++;
                    console.log(`✅ 客戶 ${client.name} 遷移成功`);
                }
            } catch (e) {
                console.error(`❌ 客戶 ${client.name} 遷移異常:`, e);
                errorCount++;
            }
        }
        
        const result = { success: true, count: successCount, errors: errorCount };
        console.log('📊 客戶遷移結果:', result);
        return result;
    },
    
    // 完整遷移流程
    async migrate() {
        console.log('%c🚀 Supabase 資料遷移開始', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
        
        // 1. 檢查 Supabase
        if (!await this.checkSupabase()) {
            return { success: false, error: 'Supabase library 未載入' };
        }
        
        // 2. 檢查 LocalStorage 資料
        const localData = this.checkLocalData();
        if (!localData.hasProjects && !localData.hasClients) {
            return { success: false, error: 'LocalStorage 沒有資料' };
        }
        
        // 3. 檢查資料表
        const tables = await this.checkTables();
        if (!tables.projectsTable || !tables.clientsTable) {
            console.log('⚠️ 資料表不存在，需要手動建立');
            await this.createTables();
            return { 
                success: false, 
                error: '資料表不存在，請查看控制台輸出的 SQL 並在 Supabase Dashboard 手動建立',
                tables: tables
            };
        }
        
        // 4. 執行遷移
        const projectResult = await this.migrateProjects();
        const clientResult = await this.migrateClients();
        
        // 5. 完成
        const finalResult = {
            success: projectResult.success && clientResult.success,
            projects: projectResult,
            clients: clientResult,
            timestamp: new Date().toISOString()
        };
        
        console.log('%c✅ 遷移完成', 'color: #10b981; font-size: 16px; font-weight: bold;');
        console.log('最終結果:', finalResult);
        
        // 標記已遷移
        localStorage.setItem('chuanhung_migration_status', JSON.stringify({
            migrated: true,
            timestamp: new Date().toISOString(),
            projects: projectResult.count,
            clients: clientResult.count
        }));
        
        return finalResult;
    }
};

// 全域函數（方便控制台呼叫）
window.migrateToSupabase = () => SUPABASE_MIGRATION.migrate();
window.checkLocalData = () => SUPABASE_MIGRATION.checkLocalData();
window.checkSupabaseTables = () => SUPABASE_MIGRATION.checkTables();

console.log('%c📦 Supabase 遷移模組已載入', 'color: #3b82f6; font-weight: bold;');
console.log('%c可用指令:', 'color: #6b7280;');
console.log('%c  migrateToSupabase() %c開始完整遷移', 'color: #3b82f6;', 'color: #6b7280;');
console.log('%c  checkLocalData() %c檢查 LocalStorage 資料', 'color: #3b82f6;', 'color: #6b7280;');
console.log('%c  checkSupabaseTables() %c檢查 Supabase 資料表', 'color: #3b82f6;', 'color: #6b7280;');
