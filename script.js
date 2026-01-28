// 이제 외부 사이트가 아니라, 로봇이 만들어준 내 파일을 읽습니다.
const DATA_FILE = './games.json';

async function fetchGameData() {
    try {
        console.log("📂 저장된 게임 데이터(games.json)를 여는 중...");
        
        // 1. 파일 읽기
        const response = await fetch(DATA_FILE);
        
        if (!response.ok) {
            throw new Error("아직 로봇이 데이터를 안 가져왔나 봐요.");
        }

        const data = await response.json();
        const games = data.items; // 저장된 구조에 따라 items를 가져옴

        if (!games || games.length === 0) throw new Error("비어있는 데이터");

        console.log("✅ 로딩 성공! 게임 개수:", games.length);

        // 2. 화면 꾸미기
        updateHeroSection(games[0]);
        updateGameGrid(games.slice(1, 13));

    } catch (error) {
        console.warn("⚠️ 파일 로드 실패. (로봇이 일하는 중일 수 있습니다)", error);
        useFallbackData(); // 아직 파일이 안 만들어졌으면 비상용 데이터 표시
    }
}

function updateHeroSection(game) {
    const heroSection = document.querySelector('.hero-section');
    const title = document.querySelector('.hero-title');
    const price = document.querySelector('.hero-price');
    const releaseDate = document.querySelector('.hero-release');
    const btn = document.querySelector('.hero-btn');

    // 이미지 경로 설정
    const heroImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/library_hero.jpg`;
    const headerImage = game.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${game.id}/header.jpg`;

    heroSection.style.backgroundImage = `url('${heroImage}'), url('${headerImage}')`;
    title.innerText = game.name;
    
    if (game.final_price === 0) {
        price.innerText = "Free to Play";
    } else {
        price.innerText = `$${(game.final_price / 100).toFixed(2)}`;
    }

    releaseDate.innerText = "Fresh from Steam";
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
    // 로봇이 아직 파일을 못 만들었을 때 보여줄 임시 데이터 (몬헌 와일즈 등)
    const fallbackGames = [
        { id: 2246340, name: "Monster Hunter Wilds", final_price: 6999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/2246340/header.jpg" },
        { id: 1245620, name: "Elden Ring", final_price: 5999, discount_percent: 0, header_image: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg" }
    ];
    updateHeroSection(fallbackGames[0]);
    updateGameGrid(fallbackGames);
}

fetchGameData();