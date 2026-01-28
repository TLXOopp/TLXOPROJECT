const fs = require('fs');

// 스팀 신작 데이터 주소
const STEAM_API = 'https://store.steampowered.com/api/featuredcategories?l=english';

async function fetchAndSave() {
    try {
        console.log("🤖 데이터 수집 시작...");
        
        // Node.js 18 이상에서는 fetch를 바로 쓸 수 있습니다.
        const response = await fetch(STEAM_API);
        const data = await response.json();
        
        // 신작 데이터만 뽑기
        const newReleases = data.NewReleases;
        
        // games.json 파일로 저장
        fs.writeFileSync('games.json', JSON.stringify(newReleases));
        console.log("✅ 저장 완료! (게임 수: " + newReleases.items.length + ")");

    } catch (error) {
        console.error("🚨 에러 발생:", error);
        process.exit(1); // 에러나면 로봇 멈춤
    }
}

fetchAndSave();