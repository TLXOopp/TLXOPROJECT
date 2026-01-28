// updater.js
const fs = require('fs');

// 스팀 신작 데이터 주소 (영어 버전)
const STEAM_API = 'https://store.steampowered.com/api/featuredcategories?l=english';

async function fetchAndSave() {
    try {
        console.log("🤖 로봇: 스팀에 데이터 요청 중...");
        
        // 로봇은 브라우저가 아니라서 CORS 문제 없이 직접 요청 가능!
        const response = await fetch(STEAM_API);
        if (!response.ok) throw new Error("스팀 응답 없음");

        const data = await response.json();
        
        // 우리가 필요한 'NewReleases'만 쏙 뽑아냅니다.
        const newReleases = data.NewReleases;
        
        if (!newReleases || !newReleases.items) {
            throw new Error("데이터 형식이 이상함");
        }

        // 데이터를 'games.json'이라는 파일로 저장합니다.
        fs.writeFileSync('games.json', JSON.stringify(newReleases));
        console.log("✅ 로봇: games.json 저장 완료! (게임 개수: " + newReleases.items.length + ")");

    } catch (error) {
        console.error("🚨 로봇: 작업 실패!", error);
        process.exit(1); // 에러 나면 로봇 멈춤
    }
}

fetchAndSave();