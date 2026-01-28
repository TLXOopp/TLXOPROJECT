const fs = require('fs');

const STEAM_API = 'https://store.steampowered.com/api/featuredcategories?l=english&cc=us';

async function fetchAndSave() {
    console.log("⚔️ 작전 2단계: 올바른 이름표 찾기...");

    try {
        const response = await fetch(STEAM_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://store.steampowered.com/',
            }
        });

        if (!response.ok) throw new Error(`서버 거부: ${response.status}`);

        const data = await response.json();

        // [수정 완료] 로그에서 확인한 대로 소문자 'new_releases'를 사용합니다.
        // 혹시 몰라서 대문자(NewReleases)와 인기작(top_sellers)도 같이 찾도록 그물을 넓혔습니다.
        const targetData = data.new_releases || data.NewReleases || data.top_sellers || data.TopSellers;

        if (!targetData || !targetData.items) {
             console.log("🔍 전체 키 목록:", Object.keys(data));
             throw new Error("데이터는 받았지만, 그 안에 게임 목록(items)이 없습니다.");
        }

        const items = targetData.items;
        
        // 데이터 저장
        const finalData = { items: items };
        fs.writeFileSync('games.json', JSON.stringify(finalData));
        console.log(`✅ 대성공! ${items.length}개의 진짜 신작 데이터를 확보했습니다.`);

    } catch (error) {
        console.error("🚨 에러 발생:", error.message);
        process.exit(1); 
    }
}

fetchAndSave();