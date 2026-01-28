// [변경 1] 배달부 주소를 'raw' 타입으로 변경하여 차단을 우회 시도
const STEAM_API_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://store.steampowered.com/api/featuredcategories?l=english');

async function fetchGameData() {
    try {
        console.log("📡 스팀 신작 데이터 요청 중...");
        
        // 타임아웃 설정: 5초 안에 응답 없으면 바로 포기하고 비상용 데이터 띄움
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(STEAM_API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);

        const steamData = await response.json();
        const newReleases = steamData.NewReleases;
        
        if (!newReleases || !newReleases.items || newReleases.items.length === 0) {
            throw new Error("신작 리스트가 비어있습니다.");
        }

        const games = newReleases.items;
        console.log("✅ 데이터 수신 성공!", games.length);

        updateHeroSection(games[0]);
        updateGameGrid(games.slice(1, 13));

    } catch (error) {
        console.warn("⚠️ 스팀 연결 실패 (오공 아님, 최신 기대작으로 대체합니다):", error);
        useFallbackData(); // 연결 실패 시 '몬스터 헌터 와일즈' 등이 나옴
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');

    // 이미지 주소 생성
    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    const headerImage = game.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/header.jpg`;

    // 배경 이미지: hero 이미지가 없으면 header 이미지라도 쓰도록 설정
    heroSection.style.backgroundImage = `url('${heroImage}'), url('${headerImage}')`;
    
    title.innerText = game.name;
    
    if (game.final_price === 0) {
        price.innerText = "Free to Play";
    } else {
        price.innerText = `$${(game.final_price / 100).toFixed(2)}`;
    }

    releaseDate.innerText = "Featured & Recommended"; 
    btn.onclick = () => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
}

function updateGameGrid(games) {
    const grid = document.getElementById('game-list');
    grid.innerHTML = ''; 

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        let priceText = '';
        if (game.final_price === 0) {
            priceText = "Free";
        } else {
            priceText = `$${(game.final_price / 100).toFixed(2)}`;
        }

        let discountHtml = '';
        if (game.discount_percent > 0) {
            discountHtml = `<span class="discount">-${game.discount_percent}%</span>`;
        }

        card.innerHTML = `
            <img src="${game.header_image}" class="card-image" alt="${game.name}">
            <div class="card-info">
                <h3 class="game-title">${game.name}</h3>
                <div class="card-meta">
                    <span style="font-size:0.8rem; color:#007aff;">New</span>
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

// [핵심 변경] 비상용 데이터를 '오공'에서 '몬스터 헌터 와일즈' 등 최신작으로 교체
function useFallbackData() {
    const fallbackGames = [
        // 1. 메인 배너: 몬스터 헌터 와일즈 (2025 기대작)
        { 
            id: 2246340, 
            name: "Monster Hunter Wilds", 
            final_price: 6999, 
            discount_percent: 0, 
            header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2246340/header.jpg" 
        },
        // 2. 문명 7
        { 
            id: 1295660, 
            name: "Sid Meier's Civilization® VII", 
            final_price: 6999, 
            discount_percent: 0, 
            header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1295660/header.jpg" 
        },
        // 3. GTA 6 (가상의 데이터로 분위기 냄)
        { 
            id: 271590, // GTA5 ID를 빌려씀
            name: "Grand Theft Auto VI", 
            final_price: 6999, 
            discount_percent: 0, 
            header_image: "https://shared.fastly.steamstatic.com/store_images/library/hero.jpg" 
        },
        { 
            id: 1086940, 
            name: "Baldur's Gate 3", 
            final_price: 5999, 
            discount_percent: 10, 
            header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg" 
        }
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
}

fetchGameData();