// 로봇이 만든 파일을 읽어옵니다
const DATA_FILE = './games.json';

async function fetchGameData() {
    try {
        // 캐시 문제 방지를 위해 현재 시간을 뒤에 붙여서 요청
        const response = await fetch(DATA_FILE + '?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error("아직 데이터 파일이 생성되지 않았습니다.");
        }

        const data = await response.json();
        const games = data.items; // updater.js가 저장한 구조 ({ items: [...] })

        if (games && games.length > 0) {
            console.log(`✅ 데이터 로드 성공! (${games.length}개)`);
            
            // 1. 화면 업데이트
            updateHeroSection(games[0]);
            updateGameGrid(games.slice(1, 13));
            
            // 2. [추가된 기능] 업데이트 시간 표시
            displayUpdateTime();
        } else {
            throw new Error("데이터는 있지만 게임 목록이 비어있음");
        }

    } catch (error) {
        console.warn("⚠️ 실시간 데이터 로드 실패 (비상용 데이터 사용):", error);
        useFallbackData(); 
    }
}

// 업데이트 시간을 화면에 찍어주는 함수
function displayUpdateTime() {
    const now = new Date();
    // 예: "Last Updated: 2026. 1. 28. 오후 2:45:00"
    const timeString = `Last Updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    const timeElement = document.getElementById('update-time');
    if (timeElement) {
        timeElement.innerText = timeString;
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');

    // 고화질 이미지 우선 사용, 없으면 헤더 이미지 사용
    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    const headerImage = game.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/header.jpg`;

    // 배경 이미지 설정
    heroSection.style.backgroundImage = `url('${heroImage}'), url('${headerImage}')`;
    
    title.innerText = game.name;
    
    // 가격 표시
    if (game.final_price === 0) {
        price.innerText = "Free to Play";
    } else {
        price.innerText = `$${(game.final_price / 100).toFixed(2)}`;
    }

    releaseDate.innerText = "Just Released on Steam"; 
    btn.onclick = () => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
}

function updateGameGrid(games) {
    const grid = document.getElementById('game-list');
    if (!grid) return; // 에러 방지
    
    grid.innerHTML = ''; 

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        let priceText = game.final_price === 0 ? "Free" : `$${(game.final_price / 100).toFixed(2)}`;
        let discountHtml = game.discount_percent > 0 ? `<span class="discount">-${game.discount_percent}%</span>` : '';

        card.innerHTML = `
            <img src="${game.header_image}" class="card-image" alt="${game.name}">
            <div class="card-info">
                <h3 class="game-title">${game.name}</h3>
                <div class="card-meta">
                    <span style="font-size:0.8rem; color:#007aff; font-weight:bold;">New</span>
                    <div>
                        ${discountHtml}
                        <span class="card-price">${priceText}</span>
                    </div>
                </div>
            </div>
        `;

        card.onclick = () => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
        grid.appendChild(card);
    });
}

// 비상용 데이터 (파일 로드 실패 시)
function useFallbackData() {
    const fallbackGames = [
        { id: 2358720, name: "Black Myth: Wukong", final_price: 5999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg" },
        { id: 1623730, name: "Palworld", final_price: 2999, discount_percent: 10, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg" },
        { id: 553850, name: "Helldivers 2", final_price: 3999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg" }
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
    
    // 비상용일 때도 시간은 표시해줌
    displayUpdateTime();
}

// 실행
fetchGameData();