// 1. 배달부 교체: 더 안정적인 corsproxy.io를 사용합니다.
const STEAM_API_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://store.steampowered.com/api/featuredcategories');

async function fetchGameData() {
    try {
        console.log("📡 스팀 서버에 신호 보내는 중...");
        const response = await fetch(STEAM_API_URL);
        
        // 2. 데이터 포장 뜯기 방식 변경 (배달부가 바뀌어서 포장 방식도 달라짐)
        // 이전 배달부(AllOrigins)와 달리, 이번 배달부는 스팀 데이터를 그대로 줍니다.
        const steamData = await response.json(); 

        const newReleases = steamData.NewReleases;
        
        if (!newReleases || !newReleases.items || newReleases.items.length === 0) {
            throw new Error("신작 리스트가 비어있습니다.");
        }

        const games = newReleases.items;
        console.log("✅ 데이터 수신 성공! 게임 개수:", games.length);

        // 1. 대형 배너 (1번째 게임)
        updateHeroSection(games[0]);

        // 2. 카드 리스트 (나머지 게임)
        updateGameGrid(games.slice(1, 13));

    } catch (error) {
        console.error("🚨 연결 실패! 원인:", error);
        // 실패하면 비상용 데이터를 보여줍니다.
        useFallbackData();
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');
    const newBadge = document.querySelector('.new-badge'); // 배지 선택자 추가

    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    
    // 이미지 설정
    heroSection.style.backgroundImage = `url('${heroImage}'), url('${game.header_image}')`;
    
    title.innerText = game.name;
    
    // 가격 표시
    if (game.final_price === 0) {
        price.innerText = "Free to Play";
    } else {
        price.innerText = `$${(game.final_price / 100).toFixed(2)}`;
    }

    // [수정] 배너에 'NEW RELEASE'라고 명확히 표시
    if(newBadge) newBadge.innerText = "NEW RELEASE";
    releaseDate.innerText = "Just Released on Steam"; 

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

        // 윈도우/맥 지원 여부 확인 (데이터에 있을 경우)
        let platformIcon = '';
        if (game.windows_available) platformIcon += '🪟 ';
        if (game.mac_available) platformIcon += '🍎 ';

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

// 비상용 데이터 (연결 실패 시에만 나옴)
function useFallbackData() {
    // 혹시라도 연결이 또 실패하면 보여줄 데이터
    const fallbackGames = [
        { id: 2358720, name: "Black Myth: Wukong (Offline Mode)", final_price: 5999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg" },
        { id: 1623730, name: "Palworld", final_price: 2999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg" },
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
}

fetchGameData();