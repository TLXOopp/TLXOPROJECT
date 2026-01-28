const STEAM_API_URL = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://store.steampowered.com/api/featuredcategories') + '&cache=' + new Date().getTime();

async function fetchGameData() {
    try {
        const response = await fetch(STEAM_API_URL);
        const data = await response.json();
        const steamData = JSON.parse(data.contents);
        
        // [중요 변경점] || 연산자를 삭제했습니다.
        // 이제 TopSellers(인기작)나 specials(할인)으로 넘어가지 않고
        // 오직 'NewReleases' 데이터가 있을 때만 작동합니다.
        const newReleases = steamData.NewReleases;
        
        if (!newReleases || !newReleases.items || newReleases.items.length === 0) {
            throw new Error("신작 데이터를 찾을 수 없습니다.");
        }

        const games = newReleases.items;

        // 1. 가장 최신이면서 주목받는 1위를 배너에 배치
        updateHeroSection(games[0]);

        // 2. 나머지 신작들을 리스트에 배치 (1번부터 12번까지)
        updateGameGrid(games.slice(1, 13));

    } catch (error) {
        console.error("데이터 로딩 실패:", error);
        // 연결 실패 시 보여줄 데이터도 '최신 기대작'으로 교체했습니다.
        useFallbackData();
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');

    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    
    // 이미지 로딩 실패 시 대비 (배너가 흰색으로 나오는 것 방지)
    heroSection.style.backgroundImage = `url('${heroImage}'), url('${game.header_image}')`;
    
    title.innerText = game.name;
    
    // 가격 표시 로직
    if (game.final_price === 0) {
        price.innerText = "Free to Play";
    } else {
        price.innerText = `$${(game.final_price / 100).toFixed(2)}`;
    }

    // 신작이므로 'Now Available'로 고정하거나 데이터가 있다면 표시
    releaseDate.innerText = "Just Released"; 

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

        // 신작 위주이므로 할인율 배지는 할인이 있을 때만 표시
        let discountHtml = '';
        if (game.discount_percent > 0) {
            discountHtml = `<span class="discount">-${game.discount_percent}%</span>`;
        }

        card.innerHTML = `
            <img src="${game.header_image}" class="card-image" alt="${game.name}">
            <div class="card-info">
                <h3 class="game-title">${game.name}</h3>
                <div class="card-meta">
                    <span>New</span>
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

// [비상용 데이터 수정]
// API가 막혔을 때 보여줄 데이터도 철 지난 게임(엘든링 등)을 빼고
// 2024-2025년 최신 화제작 위주로 변경했습니다.
function useFallbackData() {
    const fallbackGames = [
        { id: 2358720, name: "Black Myth: Wukong", final_price: 5999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg" },
        { id: 1623730, name: "Palworld", final_price: 2999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg" },
        { id: 553850, name: "Helldivers 2", final_price: 3999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg" }
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
}

fetchGameData();