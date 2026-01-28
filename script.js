// 로봇이 만들어준 파일을 읽습니다
const DATA_FILE = './games.json';

async function fetchGameData() {
    try {
        // 캐시 방지를 위해 뒤에 시간을 붙여서 요청
        const response = await fetch(DATA_FILE + '?t=' + new Date().getTime());
        
        if (!response.ok) throw new Error("데이터 파일이 아직 없습니다.");

        const data = await response.json();
        const games = data.items;

        // 화면 업데이트
        if (games && games.length > 0) {
            updateHeroSection(games[0]);
            updateGameGrid(games.slice(1, 13));
        }

    } catch (error) {
        console.log("데이터 로딩 대기 중... (로봇이 일하는 중)");
        useFallbackData(); // 파일이 없으면 비상용 데이터 표시
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');

    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    const headerImage = game.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/header.jpg`;

    heroSection.style.backgroundImage = `url('${heroImage}'), url('${headerImage}')`;
    title.innerText = game.name;
    
    price.innerText = game.final_price === 0 ? "Free to Play" : `$${(game.final_price / 100).toFixed(2)}`;
    releaseDate.innerText = "New Release"; 
    btn.onclick = () => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
}

function updateGameGrid(games) {
    const grid = document.getElementById('game-list');
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
                    <span style="font-size:0.8rem; color:#007aff;">New</span>
                    <div>${discountHtml}<span class="card-price">${priceText}</span></div>
                </div>
            </div>
        `;
        card.onclick = () => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
        grid.appendChild(card);
    });
}

function useFallbackData() {
    const fallbackGames = [
        { id: 2358720, name: "Black Myth: Wukong", final_price: 5999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg" },
        { id: 1623730, name: "Palworld", final_price: 2999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg" }
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
}

fetchGameData();