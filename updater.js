const fs = require('fs');

// [전략 1] 접속 국가를 미국(us)으로 강제 설정하여 데이터 누락 방지
const STEAM_API = 'https://store.steampowered.com/api/featuredcategories?l=english&cc=us';

async function fetchAndSave() {
    console.log("⚔️ 작전 개시: 스팀 서버 뚫기 시도...");

    try {
        // [전략 2] 완벽한 신분 위장 (헤더 조작)
        // 스팀에게 "나 로봇 아니고 진짜 크롬 브라우저야!"라고 거짓말을 합니다.
        const response = await fetch(STEAM_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://store.steampowered.com/',
                'Origin': 'https://store.steampowered.com',
                'Connection': 'keep-alive'
            }
        });

        // 스팀이 만약 403(금지)이나 429(너무 많이 요청함)로 막으면 에러 내용을 봅니다.
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`서버가 거부함 (상태코드: ${response.status}) 내용: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        // [전략 3] 데이터 정밀 검수
        // 스팀이 빈 껍데기를 주면 "이거 아니잖아!" 하고 에러를 내서 로그를 확인합니다.
        if (!data.NewReleases || !data.NewReleases.items) {
             console.log("🔍 스팀이 보낸 데이터 키 목록:", Object.keys(data));
             throw new Error("스팀이 데이터를 주긴 줬는데, 알맹이(NewReleases)가 없습니다.");
        }

        const items = data.NewReleases.items;
        
        // 데이터 저장
        const finalData = { items: items };
        fs.writeFileSync('games.json', JSON.stringify(finalData));
        console.log(`✅ 작전 성공! 진짜 실시간 신작 ${items.length}개를 탈취했습니다.`);

    } catch (error) {
        console.error("🚨 돌파 실패! 원인 분석:", error.message);
        // 이번에는 가짜 데이터를 쓰지 않고, 왜 안 됐는지 원인을 파악하기 위해 에러를 그대로 냅니다.
        process.exit(1); 
    }
}

fetchAndSave();