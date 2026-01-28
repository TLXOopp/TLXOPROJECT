const fs = require('fs');

// 스팀 스토어의 추천 카테고리 API
const STEAM_API = 'https://store.steampowered.com/api/featuredcategories?l=english';

async function fetchAndSave() {
    try {
        console.log("🤖 로봇: 스팀 서버에 접속 시도 중...");
        
        // 1. 데이터 요청
        const response = await fetch(STEAM_API, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });

        if (!response.ok) {
            throw new Error(`서버 응답 오류 (상태코드: ${response.status})`);
        }

        const data = await response.json();
        
        // 2. 디버깅: 스팀이 대체 뭐라고 보냈는지 로그 찍어보기
        console.log("📦 받은 데이터 키 목록:", Object.keys(data));

        // 3. 데이터 찾기 (NewReleases가 없으면 다른 거라도 찾도록 유연하게 대처)
        let items = [];
        
        if (data.NewReleases && data.NewReleases.items) {
            console.log("✅ 'NewReleases' 발견!");
            items = data.NewReleases.items;
        } else if (data.TopSellers && data.TopSellers.items) {
            console.log("⚠️ NewReleases 없음. 대신 'TopSellers' 사용");
            items = data.TopSellers.items;
        } else if (data.specials && data.specials.items) {
            console.log("⚠️ NewReleases 없음. 대신 'specials' 사용");
            items = data.specials.items;
        }

        // 4. 데이터 검증 및 저장
        if (items.length > 0) {
            // 우리가 필요한 형식으로 포장해서 저장 (items 배열을 감싸서 저장)
            const finalData = { items: items };
            fs.writeFileSync('games.json', JSON.stringify(finalData));
            console.log(`🎉 성공! ${items.length}개의 게임 데이터를 'games.json'에 저장했습니다.`);
        } else {
            throw new Error("❌ API 응답에 게임 목록(items)이 전혀 없습니다. (API 구조 변경 가능성)");
        }

    } catch (error) {
        console.error("🚨 치명적 오류 발생:", error);
        process.exit(1); // 에러 나면 로봇 멈춤
    }
}

fetchAndSave();